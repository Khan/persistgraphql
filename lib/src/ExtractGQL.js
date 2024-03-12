"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.ExtractGQL = exports.PathType = void 0;
var fs = require("fs");
var path = require("path");
var graphql_1 = require("graphql");
var extractFromAST_1 = require("./extractFromAST");
var extractFromJS_1 = require("./extractFromJS");
var common_1 = require("./common");
var queryTransformers_1 = require("./queryTransformers");
var _ = require("lodash");
var PathType;
(function (PathType) {
    PathType[PathType["DIRECTORY"] = 0] = "DIRECTORY";
    PathType[PathType["FILE"] = 1] = "FILE";
    PathType[PathType["SYMBOLIC_LINK"] = 2] = "SYMBOLIC_LINK";
})(PathType || (exports.PathType = PathType = {}));
;
var ExtractGQL = (function () {
    function ExtractGQL(_a) {
        var inputFilePath = _a.inputFilePath, _b = _a.outputFilePath, outputFilePath = _b === void 0 ? 'extracted_queries.json' : _b, _c = _a.queryTransformers, queryTransformers = _c === void 0 ? [] : _c, _d = _a.extensions, extensions = _d === void 0 ? ['graphql'] : _d, _e = _a.inJsCode, inJsCode = _e === void 0 ? false : _e, _f = _a.excludePaths, excludePaths = _f === void 0 ? [] : _f;
        this.queryId = 0;
        this.queryTransformers = [];
        this.extensions = [];
        this.inJsCode = false;
        this.excludePaths = [];
        this.literalTag = 'gql';
        this.inputFilePath = ExtractGQL.normalizePath(inputFilePath);
        this.outputFilePath = outputFilePath;
        this.queryTransformers = queryTransformers;
        this.extensions = extensions;
        this.inJsCode = inJsCode;
        this.excludePaths = excludePaths;
    }
    ExtractGQL.getFileExtension = function (filePath) {
        var pieces = path.basename(filePath).split('.');
        if (pieces.length <= 1) {
            return '';
        }
        return pieces[pieces.length - 1];
    };
    ExtractGQL.readFile = function (filePath) {
        return new Promise(function (resolve, reject) {
            fs.readFile(filePath, 'utf8', function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    };
    ExtractGQL.pathType = function (path) {
        return new Promise(function (resolve, reject) {
            fs.lstat(path, function (err, stats) {
                if (err) {
                    reject(err);
                }
                else {
                    if (stats.isDirectory()) {
                        resolve(PathType.DIRECTORY);
                    }
                    else if (stats.isSymbolicLink()) {
                        resolve(PathType.SYMBOLIC_LINK);
                    }
                    else {
                        resolve(PathType.FILE);
                    }
                }
            });
        });
    };
    ExtractGQL.normalizePath = function (path) {
        while (path.slice(-1) === '/') {
            path = path.slice(0, -1);
        }
        return path;
    };
    ExtractGQL.prototype.addQueryTransformer = function (queryTransformer) {
        this.queryTransformers.push(queryTransformer);
    };
    ExtractGQL.prototype.applyQueryTransformers = function (document) {
        return (0, common_1.applyQueryTransformers)(document, this.queryTransformers);
    };
    ExtractGQL.prototype.getQueryKey = function (definition) {
        return (0, common_1.getQueryKey)(definition, this.queryTransformers);
    };
    ExtractGQL.prototype.getQueryDocumentKey = function (document) {
        return (0, common_1.getQueryDocumentKey)(document, this.queryTransformers);
    };
    ExtractGQL.prototype.createMapFromDocument = function (document) {
        var _this = this;
        var transformedDocument = this.applyQueryTransformers(document);
        var queryDefinitions = (0, extractFromAST_1.getOperationDefinitions)(transformedDocument);
        var result = {};
        queryDefinitions.forEach(function (transformedDefinition) {
            var transformedQueryWithFragments = _this.getQueryFragments(transformedDocument, transformedDefinition);
            transformedQueryWithFragments.definitions.unshift(transformedDefinition);
            var docQueryKey = _this.getQueryDocumentKey(transformedQueryWithFragments);
            result[docQueryKey] = _this.getQueryId();
        });
        return result;
    };
    ExtractGQL.prototype.processGraphQLFile = function (graphQLFile) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            ExtractGQL.readFile(graphQLFile).then(function (fileContents) {
                var graphQLDocument = (0, graphql_1.parse)(fileContents);
                resolve(_this.createMapFromDocument(graphQLDocument));
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    ExtractGQL.prototype.createOutputMapFromString = function (docString) {
        var _this = this;
        var doc = (0, graphql_1.parse)(docString);
        var operationNames = new Set();
        var duplicates = new Set();
        for (var i = 0; i < doc.definitions.length; i++) {
            var name_1 = doc.definitions[i].name.value;
            if (operationNames.has(name_1)) {
                console.log('Duplicate operation name found: ' + name_1);
                duplicates.add(name_1);
            }
            operationNames.add(name_1);
        }
        if (duplicates.size !== 0) {
            var dupes = "";
            duplicates.forEach(function (name) {
                dupes += name + ", ";
            });
            dupes = dupes.substring(0, dupes.length - 2);
            console.log("Found the following duplicate GraphQL operation names: " + dupes);
            process.exit(1);
        }
        var docMap = (0, graphql_1.separateOperations)(doc);
        var resultMaps = Object.keys(docMap).map(function (operationName) {
            var document = docMap[operationName];
            return _this.createMapFromDocument(document);
        });
        return _.merge.apply(_, __spreadArray([{}], resultMaps, false));
    };
    ExtractGQL.prototype.readGraphQLFile = function (graphQLFile) {
        return ExtractGQL.readFile(graphQLFile);
    };
    ExtractGQL.prototype.readInputFile = function (inputFile) {
        var _this = this;
        return Promise.resolve().then(function () {
            var extension = ExtractGQL.getFileExtension(inputFile);
            if (_this.extensions.indexOf(extension) > -1) {
                if (_this.inJsCode) {
                    return ExtractGQL.readFile(inputFile).then(function (result) {
                        var literalContents = (0, extractFromJS_1.findTaggedTemplateLiteralsInJS)(result, _this.literalTag);
                        var noInterps = literalContents.map(extractFromJS_1.eliminateInterpolations);
                        var joined = noInterps.join('\n');
                        return joined;
                    });
                }
                else {
                    return _this.readGraphQLFile(inputFile);
                }
            }
            else {
                return '';
            }
        });
    };
    ExtractGQL.prototype.processInputPath = function (inputPath) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.readInputPath(inputPath).then(function (docString) {
                resolve(_this.createOutputMapFromString(docString));
            }).catch(function (err) {
                reject(err);
            });
        });
    };
    ExtractGQL.prototype.readInputPath = function (inputPath) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            ExtractGQL.pathType(inputPath).then(function (pathType) {
                var isExcludedPath = false;
                for (var _i = 0, _a = _this.excludePaths; _i < _a.length; _i++) {
                    var excludePath = _a[_i];
                    var re = new RegExp(excludePath);
                    if (re.test(inputPath)) {
                        isExcludedPath = true;
                        break;
                    }
                }
                if (isExcludedPath) {
                    resolve('');
                }
                else if (pathType === PathType.SYMBOLIC_LINK) {
                    resolve('');
                }
                else if (pathType === PathType.DIRECTORY) {
                    fs.readdir(inputPath, function (err, items) {
                        if (err) {
                            reject(err);
                        }
                        var promises = items.map(function (item) {
                            return _this.readInputPath(inputPath + '/' + item);
                        });
                        Promise.all(promises).then(function (queryStrings) {
                            resolve(queryStrings.reduce(function (x, y) { return x + y; }, ""));
                        });
                    });
                }
                else {
                    _this.readInputFile(inputPath).then(function (result) {
                        resolve(result);
                    }).catch(function (err) {
                        console.log("Error occurred in processing path ".concat(inputPath, ": "));
                        console.log(err.message);
                        reject(err);
                    });
                }
            });
        });
    };
    ExtractGQL.prototype.getQueryFragments = function (document, queryDefinition) {
        var queryFragmentNames = (0, extractFromAST_1.getFragmentNames)(queryDefinition.selectionSet, document);
        var retDocument = {
            kind: graphql_1.Kind.DOCUMENT,
            definitions: [],
        };
        var reduceQueryDefinitions = function (carry, definition) {
            var definitionName = definition.name;
            if (((0, extractFromAST_1.isFragmentDefinition)(definition) && queryFragmentNames[definitionName.value] === 1)) {
                var definitionExists = carry.findIndex(function (value) { return value.name.value === definitionName.value; }) !== -1;
                if (!definitionExists) {
                    return __spreadArray(__spreadArray([], carry, true), [definition], false);
                }
            }
            return carry;
        };
        retDocument.definitions = document.definitions.reduce(reduceQueryDefinitions, []).sort(common_1.sortFragmentsByName);
        return retDocument;
    };
    ExtractGQL.prototype.getQueryId = function () {
        this.queryId += 1;
        return this.queryId;
    };
    ExtractGQL.prototype.writeOutputMap = function (outputMap, outputFilePath) {
        return new Promise(function (resolve, reject) {
            fs.open(outputFilePath, 'w+', function (openErr, fd) {
                if (openErr) {
                    reject(openErr);
                }
                fs.write(fd, JSON.stringify(outputMap), function (writeErr, written, str) {
                    if (writeErr) {
                        reject(writeErr);
                    }
                    resolve();
                });
            });
        });
    };
    ExtractGQL.prototype.extract = function () {
        var _this = this;
        this.processInputPath(this.inputFilePath).then(function (outputMap) {
            _this.writeOutputMap(outputMap, _this.outputFilePath).then(function () {
                console.log("Wrote output file to ".concat(_this.outputFilePath, "."));
            }).catch(function (err) {
                console.log("Unable to process path ".concat(_this.outputFilePath, ". Error message: "));
                console.log("".concat(err.message));
            });
        });
    };
    return ExtractGQL;
}());
exports.ExtractGQL = ExtractGQL;
var main = function (argv) {
    var args = argv._;
    var inputFilePath;
    var outputFilePath;
    var queryTransformers = [];
    if (args.length < 1) {
        console.log('Usage: persistgraphql input_file [output_file]');
    }
    else if (args.length === 1) {
        inputFilePath = args[0];
    }
    else {
        inputFilePath = args[0];
        outputFilePath = args[1];
    }
    if (argv['add_typename']) {
        console.log('Using the add-typename query transformer.');
        queryTransformers.push(queryTransformers_1.addTypenameTransformer);
    }
    var options = {
        inputFilePath: inputFilePath,
        outputFilePath: outputFilePath,
        queryTransformers: queryTransformers,
    };
    if (argv['js']) {
        options.inJsCode = true;
    }
    if (argv['extension']) {
        options.extensions = argv['extension'].split(',');
    }
    if (argv['exclude']) {
        options.excludePaths = argv['exclude'].split(',');
    }
    new ExtractGQL(options).extract();
};
exports.main = main;
//# sourceMappingURL=ExtractGQL.js.map
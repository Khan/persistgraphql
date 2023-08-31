"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var assert = chai.assert;
var extractFromAST_1 = require("../src/extractFromAST");
var ExtractGQL_1 = require("../src/ExtractGQL");
var queryTransformers_1 = require("../src/queryTransformers");
var graphql_1 = require("graphql");
var graphql_tag_1 = require("graphql-tag");
describe('ExtractGQL', function () {
    var queries = (0, graphql_tag_1.default)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    query firstQuery {\n      author {\n        firstName\n        lastName\n      }\n    }\n\n    query secondQuery {\n      person { \n        firstName\n        lastName\n      }\n    }"], ["\n    query firstQuery {\n      author {\n        firstName\n        lastName\n      }\n    }\n\n    query secondQuery {\n      person { \n        firstName\n        lastName\n      }\n    }"])));
    var egql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'not-real' });
    var keys = [
        egql.getQueryKey(queries.definitions[0]),
        egql.getQueryKey(queries.definitions[1]),
    ];
    it('should be able to construct an instance', function () {
        assert.doesNotThrow(function () {
            new ExtractGQL_1.ExtractGQL({
                inputFilePath: 'queries.graphql',
                outputFilePath: 'output.json',
            });
        });
    });
    describe('pathType', function () {
        it('should return PathType.DIRECTORY on a directory', function (done) {
            ExtractGQL_1.ExtractGQL.pathType('./test/fixtures').then(function (result) {
                assert(result === ExtractGQL_1.PathType.DIRECTORY);
                done();
            });
        });
        it('should return PathType.FILE on a file', function (done) {
            ExtractGQL_1.ExtractGQL.pathType('./test/fixtures/single_query/queries.graphql').then(function (result) {
                assert(result === ExtractGQL_1.PathType.FILE);
                done();
            });
        });
    });
    describe('getFileExtension', function () {
        it('should return the correct extension on a file with an extension', function () {
            assert.equal(ExtractGQL_1.ExtractGQL.getFileExtension('../../path/source.graphql'), 'graphql');
            assert.equal(ExtractGQL_1.ExtractGQL.getFileExtension('/some/complicated/path.with.dots/dots../view.js'), 'js');
        });
        it('should return an empty string if the file has no extension', function () {
            assert.equal(ExtractGQL_1.ExtractGQL.getFileExtension('/redherring.graphql/file'), '');
            assert.equal(ExtractGQL_1.ExtractGQL.getFileExtension('file'), '');
        });
    });
    describe('readFile', function () {
        it('should be able to read a file into a string', function (done) {
            var filePath = 'test/fixtures/single_query/queries.graphql';
            ExtractGQL_1.ExtractGQL.readFile(filePath).then(function (result) {
                var graphQLString = (0, graphql_1.print)((0, graphql_1.parse)(result));
                assert.deepEqual(graphQLString, (0, graphql_1.print)(queries));
                done();
            });
        });
    });
    describe('createMapFromDocument', function () {
        it('should be able to handle a document with no queries', function () {
            var document = (0, graphql_tag_1.default)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["fragment something on Type { otherThing }"], ["fragment something on Type { otherThing }"])));
            var map = egql.createMapFromDocument(document);
            assert.deepEqual(map, {});
        });
        it('should be able to handle a document with a single query', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'nothing' });
            var document = (0, graphql_tag_1.default)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["query author {\n        name\n      }"], ["query author {\n        name\n      }"])));
            var map = myegql.createMapFromDocument(document);
            var key = egql.getQueryDocumentKey(document);
            assert.equal(Object.keys(map).length, 1);
            assert.equal(map[key], 1);
        });
        it('should be able to handle a document with a fragment', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (0, graphql_tag_1.default)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], ["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "])));
            var map = myegql.createMapFromDocument(document);
            var key = myegql.getQueryDocumentKey(document);
            assert.equal(Object.keys(map).length, 1);
            assert.equal(map[key], 1);
        });
        it('should be able to handle a document with multiple fragments', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (0, graphql_tag_1.default)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n        query authorList {\n          author {\n            ...authorDetails\n            ...otherDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n        fragment otherDetails on Author {\n          author\n        }"], ["\n        query authorList {\n          author {\n            ...authorDetails\n            ...otherDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n        fragment otherDetails on Author {\n          author\n        }"])));
            var map = myegql.createMapFromDocument(document);
            assert.equal(Object.keys(map)[0], (0, graphql_1.print)(document));
        });
        it('should be able to handle a document with unused fragments', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (0, graphql_tag_1.default)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n        query authorList {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment pointlessFragment on Author {\n          firstName\n          lastName\n        }\n      "], ["\n        query authorList {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment pointlessFragment on Author {\n          firstName\n          lastName\n        }\n      "])));
            var map = egql.createMapFromDocument(document);
            assert.equal(Object.keys(map)[0], (0, graphql_1.print)((0, extractFromAST_1.createDocumentFromQuery)(document.definitions[0])));
        });
        it('should be able to handle a document with multiple queries sharing a fragment', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (0, graphql_tag_1.default)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        query authorInfo {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], ["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        query authorInfo {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "])));
            var authorList = (0, graphql_tag_1.default)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], ["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "])));
            var authorInfo = (0, graphql_tag_1.default)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n        query authorInfo {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], ["\n        query authorInfo {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "])));
            var map = myegql.createMapFromDocument(document);
            var key1 = myegql.getQueryDocumentKey(authorList);
            var key2 = myegql.getQueryDocumentKey(authorInfo);
            assert.equal(key1, (0, graphql_1.print)(authorList));
            assert.property(map, key1);
            assert.equal(key2, (0, graphql_1.print)(authorInfo));
            assert.property(map, key2);
        });
        it('should be able to handle a document with multiple queries', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (0, graphql_tag_1.default)(templateObject_10 || (templateObject_10 = __makeTemplateObject(["query author {\n        name\n      }\n      query person {\n        name\n      }"], ["query author {\n        name\n      }\n      query person {\n        name\n      }"])));
            var map = myegql.createMapFromDocument(document);
            var keys = Object.keys(map);
            assert.equal(keys.length, 2);
            assert.include(keys, myegql.getQueryDocumentKey((0, extractFromAST_1.createDocumentFromQuery)(document.definitions[0])));
            assert.include(keys, myegql.getQueryDocumentKey((0, extractFromAST_1.createDocumentFromQuery)(document.definitions[1])));
        });
        it('should be able to apply query transforms to a document with fragments', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({
                inputFilePath: 'empty',
                queryTransformers: [queryTransformers_1.addTypenameTransformer],
            });
            var document = (0, graphql_tag_1.default)(templateObject_11 || (templateObject_11 = __makeTemplateObject(["\n      query {\n        author {\n          ...details\n        }\n      }\n      fragment details on Author {\n        name {\n          firstName\n          lastName\n        }\n      }"], ["\n      query {\n        author {\n          ...details\n        }\n      }\n      fragment details on Author {\n        name {\n          firstName\n          lastName\n        }\n      }"])));
            var transformedDocument = (0, graphql_tag_1.default)(templateObject_12 || (templateObject_12 = __makeTemplateObject(["\n      query {\n        author {\n          ...details\n          __typename\n        }\n      }\n      fragment details on Author {\n        name {\n          firstName\n          lastName\n          __typename\n        }\n      }"], ["\n      query {\n        author {\n          ...details\n          __typename\n        }\n      }\n      fragment details on Author {\n        name {\n          firstName\n          lastName\n          __typename\n        }\n      }"])));
            var map = myegql.createMapFromDocument(document);
            assert.equal(Object.keys(map).length, 1);
            var key = myegql.getQueryDocumentKey(transformedDocument);
            assert.equal(Object.keys(map)[0], key);
            assert.equal(map[key], 1);
        });
        it('should be able to handle a document with a mutation', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (0, graphql_tag_1.default)(templateObject_13 || (templateObject_13 = __makeTemplateObject(["\n        mutation changeAuthorStuff {\n          firstName\n          lastName\n        }"], ["\n        mutation changeAuthorStuff {\n          firstName\n          lastName\n        }"])));
            var map = myegql.createMapFromDocument(document);
            var keys = Object.keys(map);
            assert.equal(keys.length, 1);
            assert.equal(keys[0], myegql.getQueryDocumentKey(document));
            assert.equal(map[keys[0]], 1);
        });
        it('should sort fragments correctly', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var doc = (0, graphql_tag_1.default)(templateObject_14 || (templateObject_14 = __makeTemplateObject(["\n        fragment d on Author { x } \n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment a on Author { x }\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }"], ["\n        fragment d on Author { x } \n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment a on Author { x }\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }"])));
            var result = (0, graphql_tag_1.default)(templateObject_15 || (templateObject_15 = __makeTemplateObject(["\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }\n        fragment a on Author { x }\n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment d on Author { x }"], ["\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }\n        fragment a on Author { x }\n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment d on Author { x }"])));
            var map = myegql.createMapFromDocument(doc);
            var keys = Object.keys(map);
            assert.equal(keys.length, 1);
            assert.equal(keys[0], (0, graphql_1.print)(result));
        });
    });
    describe('queryTransformers', function () {
        it('should be able to transform a document before writing it to the output map', function () {
            var originalDocument = (0, graphql_tag_1.default)(templateObject_16 || (templateObject_16 = __makeTemplateObject(["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "], ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "])));
            var newDocument = (0, graphql_tag_1.default)(templateObject_17 || (templateObject_17 = __makeTemplateObject(["\n        query {\n          person {\n            name\n          }\n        }\n      "], ["\n        query {\n          person {\n            name\n          }\n        }\n      "])));
            var newQueryDef = newDocument.definitions[0];
            var queryTransformer = function (queryDoc) {
                return newDocument;
            };
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            myegql.addQueryTransformer(queryTransformer);
            var map = myegql.createMapFromDocument(originalDocument);
            var keys = Object.keys(map);
            assert.equal(keys.length, 1);
            assert.equal(keys[0], myegql.getQueryDocumentKey(newDocument));
        });
    });
    describe('processGraphQLFile', function () {
        it('should be able to load a GraphQL file with multiple queries', function (done) {
            egql.processGraphQLFile('./test/fixtures/single_query/queries.graphql').then(function (documentMap) {
                assert.equal(Object.keys(documentMap).length, 2);
                done();
            });
        });
    });
    describe('readInputFile', function () {
        it('should return an empty string on a file with an unknown extension', function (done) {
            egql.readInputFile('./test/fixtures/bad.c').then(function (result) {
                assert.deepEqual(result, '');
                done();
            });
        });
        it('should correctly process a file with a .graphql extension', function (done) {
            egql.readInputFile('./test/fixtures/single_query/queries.graphql').then(function (result) {
                assert.equal(result.split('\n').length, 14);
                assert.include(result, 'query firstQuery {');
                assert.include(result, 'person {');
                assert.include(result, 'lastName');
                done();
            });
        });
    });
    describe('processInputPath', function () {
        it('should process a single file', function (done) {
            egql.processInputPath('./test/fixtures/single_query/queries.graphql').then(function (result) {
                assert.equal(Object.keys(result).length, 2);
                assert.include(Object.keys(result), (0, graphql_1.print)((0, extractFromAST_1.createDocumentFromQuery)(queries.definitions[0])));
                assert.include(Object.keys(result), (0, graphql_1.print)((0, extractFromAST_1.createDocumentFromQuery)(queries.definitions[1])));
                done();
            });
        });
        it('should process a directory with a single file', function (done) {
            egql.processInputPath('./test/fixtures/single_query').then(function (result) {
                assert.equal(Object.keys(result).length, 2);
                assert.include(Object.keys(result), (0, graphql_1.print)((0, extractFromAST_1.createDocumentFromQuery)(queries.definitions[0])));
                assert.include(Object.keys(result), (0, graphql_1.print)((0, extractFromAST_1.createDocumentFromQuery)(queries.definitions[1])));
                done();
            });
        });
        it('should process a file with a fragment reference to a different file', function () {
            var expectedQuery = (0, graphql_tag_1.default)(templateObject_18 || (templateObject_18 = __makeTemplateObject(["\n        query firstQuery {\n          author {\n            ...details\n          }\n        }\n        fragment details on Author {\n          firstName\n          lastName\n        }\n        "], ["\n        query firstQuery {\n          author {\n            ...details\n          }\n        }\n        fragment details on Author {\n          firstName\n          lastName\n        }\n        "])));
            return egql.processInputPath('./test/fixtures/single_fragment').then(function (result) {
                var keys = Object.keys(result);
                assert.equal(keys.length, 1);
                assert.include(Object.keys(result), (0, graphql_1.print)(expectedQuery));
            });
        });
        it('should process a JS file with queries', function () {
            var expectedQuery = (0, graphql_tag_1.default)(templateObject_19 || (templateObject_19 = __makeTemplateObject(["\n        query firstQuery {\n          author {\n            ...details\n          }\n        }\n        fragment details on Author {\n          firstName\n          lastName\n        }\n        "], ["\n        query firstQuery {\n          author {\n            ...details\n          }\n        }\n        fragment details on Author {\n          firstName\n          lastName\n        }\n        "])));
            var jsEgql = new ExtractGQL_1.ExtractGQL({
                inputFilePath: 'idk',
                extensions: ['js'],
                inJsCode: true,
                outputFilePath: 'idk',
            });
            return jsEgql.processInputPath('./test/fixtures/single_fragment_js')
                .then(function (result) {
                var keys = Object.keys(result);
                assert.equal(keys.length, 1);
                assert.equal(keys[0], (0, graphql_1.print)(expectedQuery));
            });
        });
    });
    describe('writeOutputMap', function () {
        it('should be able to write an OutputMap to a file', function (done) {
            var outputMap = egql.createMapFromDocument(queries);
            egql.writeOutputMap(outputMap, './test/output_tests/output.graphql').then(function () {
                done();
            }).catch(function (err) {
                done(err);
            });
        });
    });
    describe('getQueryKey', function () {
        it('should apply query transformers before returning the query key', function () {
            var query = (0, graphql_tag_1.default)(templateObject_20 || (templateObject_20 = __makeTemplateObject(["\n        query {\n          author {\n            firstName\n            middleName\n            lastName\n          }\n        }"], ["\n        query {\n          author {\n            firstName\n            middleName\n            lastName\n          }\n        }"])));
            var transformedQuery = (0, graphql_tag_1.default)(templateObject_21 || (templateObject_21 = __makeTemplateObject(["\n        query {\n          author {\n            firstName\n            middleName\n            lastName\n            __typename\n          }\n        }"], ["\n        query {\n          author {\n            firstName\n            middleName\n            lastName\n            __typename\n          }\n        }"])));
            var myegql = new ExtractGQL_1.ExtractGQL({
                inputFilePath: "---",
                queryTransformers: [queryTransformers_1.addTypenameTransformer],
            });
            assert.equal(myegql.getQueryKey(query.definitions[0]), (0, graphql_1.print)(transformedQuery.definitions[0]));
        });
    });
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11, templateObject_12, templateObject_13, templateObject_14, templateObject_15, templateObject_16, templateObject_17, templateObject_18, templateObject_19, templateObject_20, templateObject_21;
//# sourceMappingURL=index.js.map
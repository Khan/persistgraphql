"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var assert = chai.assert;
var extractFromAST_1 = require("../src/extractFromAST");
var ExtractGQL_1 = require("../src/ExtractGQL");
var queryTransformers_1 = require("../src/queryTransformers");
var graphql_1 = require("graphql");
var graphql_tag_1 = require("graphql-tag");
describe('ExtractGQL', function () {
    var queries = (_a = ["\n    query {\n      author {\n        firstName\n        lastName\n      }\n    }\n\n    query otherQuery {\n      person {\n        firstName\n        lastName\n      }\n    }"], _a.raw = ["\n    query {\n      author {\n        firstName\n        lastName\n      }\n    }\n\n    query otherQuery {\n      person {\n        firstName\n        lastName\n      }\n    }"], graphql_tag_1.default(_a));
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
                var graphQLString = graphql_1.print(graphql_1.parse(result));
                assert.deepEqual(graphQLString, graphql_1.print(queries));
                done();
            });
        });
    });
    describe('createMapFromDocument', function () {
        it('should be able to handle a document with no queries', function () {
            var document = (_a = ["fragment something on Type { otherThing }"], _a.raw = ["fragment something on Type { otherThing }"], graphql_tag_1.default(_a));
            var map = egql.createMapFromDocument(document);
            assert.deepEqual(map, {});
            var _a;
        });
        it('should be able to handle a document with a single query', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'nothing' });
            var document = (_a = ["query author {\n        name\n      }"], _a.raw = ["query author {\n        name\n      }"], graphql_tag_1.default(_a));
            var map = myegql.createMapFromDocument(document);
            var key = egql.getQueryDocumentKey(document);
            assert.equal(Object.keys(map).length, 1);
            assert.equal(map[key], 1);
            var _a;
        });
        it('should be able to handle a document with a fragment', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (_a = ["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], _a.raw = ["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], graphql_tag_1.default(_a));
            var map = myegql.createMapFromDocument(document);
            var key = myegql.getQueryDocumentKey(document);
            assert.equal(Object.keys(map).length, 1);
            assert.equal(map[key], 1);
            var _a;
        });
        it('should be able to handle a document with multiple fragments', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (_a = ["\n        query authorList {\n          author {\n            ...authorDetails\n            ...otherDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n        fragment otherDetails on Author {\n          author\n        }"], _a.raw = ["\n        query authorList {\n          author {\n            ...authorDetails\n            ...otherDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n        fragment otherDetails on Author {\n          author\n        }"], graphql_tag_1.default(_a));
            var map = myegql.createMapFromDocument(document);
            assert.equal(Object.keys(map)[0], graphql_1.print(document));
            var _a;
        });
        it('should be able to handle a document with unused fragments', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (_a = ["\n        query authorList {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment pointlessFragment on Author {\n          firstName\n          lastName\n        }\n      "], _a.raw = ["\n        query authorList {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment pointlessFragment on Author {\n          firstName\n          lastName\n        }\n      "], graphql_tag_1.default(_a));
            var map = egql.createMapFromDocument(document);
            assert.equal(Object.keys(map)[0], graphql_1.print(extractFromAST_1.createDocumentFromQuery(document.definitions[0])));
            var _a;
        });
        it('should be able to handle a document with multiple queries sharing a fragment', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (_a = ["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        query authorInfo {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], _a.raw = ["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        query authorInfo {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], graphql_tag_1.default(_a));
            var authorList = (_b = ["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], _b.raw = ["\n        query authorList {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], graphql_tag_1.default(_b));
            var authorInfo = (_c = ["\n        query authorInfo {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], _c.raw = ["\n        query authorInfo {\n          author {\n            ...authorDetails\n          }\n        }\n        fragment authorDetails on Author {\n          firstName\n          lastName\n        }\n      "], graphql_tag_1.default(_c));
            var map = myegql.createMapFromDocument(document);
            var key1 = myegql.getQueryDocumentKey(authorList);
            var key2 = myegql.getQueryDocumentKey(authorInfo);
            assert.equal(key1, graphql_1.print(authorList));
            assert.property(map, key1);
            assert.equal(key2, graphql_1.print(authorInfo));
            assert.property(map, key2);
            var _a, _b, _c;
        });
        it('should be able to handle a document with multiple queries', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (_a = ["query author {\n        name\n      }\n      query person {\n        name\n      }"], _a.raw = ["query author {\n        name\n      }\n      query person {\n        name\n      }"], graphql_tag_1.default(_a));
            var map = myegql.createMapFromDocument(document);
            var keys = Object.keys(map);
            assert.equal(keys.length, 2);
            assert.include(keys, myegql.getQueryDocumentKey(extractFromAST_1.createDocumentFromQuery(document.definitions[0])));
            assert.include(keys, myegql.getQueryDocumentKey(extractFromAST_1.createDocumentFromQuery(document.definitions[1])));
            var _a;
        });
        it('should be able to apply query transforms to a document with fragments', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({
                inputFilePath: 'empty',
                queryTransformers: [queryTransformers_1.addTypenameTransformer],
            });
            var document = (_a = ["\n      query {\n        author {\n          ...details\n        }\n      }\n      fragment details on Author {\n        name {\n          firstName\n          lastName\n        }\n      }"], _a.raw = ["\n      query {\n        author {\n          ...details\n        }\n      }\n      fragment details on Author {\n        name {\n          firstName\n          lastName\n        }\n      }"], graphql_tag_1.default(_a));
            var transformedDocument = (_b = ["\n      query {\n        author {\n          ...details\n          __typename\n        }\n      }\n      fragment details on Author {\n        name {\n          firstName\n          lastName\n          __typename\n        }\n      }"], _b.raw = ["\n      query {\n        author {\n          ...details\n          __typename\n        }\n      }\n      fragment details on Author {\n        name {\n          firstName\n          lastName\n          __typename\n        }\n      }"], graphql_tag_1.default(_b));
            var map = myegql.createMapFromDocument(document);
            assert.equal(Object.keys(map).length, 1);
            var key = myegql.getQueryDocumentKey(transformedDocument);
            assert.equal(Object.keys(map)[0], key);
            assert.equal(map[key], 1);
            var _a, _b;
        });
        it('should be able to handle a document with a mutation', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var document = (_a = ["\n        mutation changeAuthorStuff {\n          firstName\n          lastName\n        }"], _a.raw = ["\n        mutation changeAuthorStuff {\n          firstName\n          lastName\n        }"], graphql_tag_1.default(_a));
            var map = myegql.createMapFromDocument(document);
            var keys = Object.keys(map);
            assert.equal(keys.length, 1);
            assert.equal(keys[0], myegql.getQueryDocumentKey(document));
            assert.equal(map[keys[0]], 1);
            var _a;
        });
        it('should sort fragments correctly', function () {
            var myegql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'empty' });
            var doc = (_a = ["\n        fragment d on Author { x } \n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment a on Author { x }\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }"], _a.raw = ["\n        fragment d on Author { x } \n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment a on Author { x }\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }"], graphql_tag_1.default(_a));
            var result = (_b = ["\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }\n        fragment a on Author { x }\n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment d on Author { x }"], _b.raw = ["\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }\n        fragment a on Author { x }\n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment d on Author { x }"], graphql_tag_1.default(_b));
            var map = myegql.createMapFromDocument(doc);
            var keys = Object.keys(map);
            assert.equal(keys.length, 1);
            assert.equal(keys[0], graphql_1.print(result));
            var _a, _b;
        });
    });
    describe('queryTransformers', function () {
        it('should be able to transform a document before writing it to the output map', function () {
            var originalDocument = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "], graphql_tag_1.default(_a));
            var newDocument = (_b = ["\n        query {\n          person {\n            name\n          }\n        }\n      "], _b.raw = ["\n        query {\n          person {\n            name\n          }\n        }\n      "], graphql_tag_1.default(_b));
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
            var _a, _b;
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
                assert.include(result, 'query {');
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
                assert.include(Object.keys(result), graphql_1.print(extractFromAST_1.createDocumentFromQuery(queries.definitions[0])));
                assert.include(Object.keys(result), graphql_1.print(extractFromAST_1.createDocumentFromQuery(queries.definitions[1])));
                done();
            });
        });
        it('should process a directory with a single file', function (done) {
            egql.processInputPath('./test/fixtures/single_query').then(function (result) {
                assert.equal(Object.keys(result).length, 2);
                assert.include(Object.keys(result), graphql_1.print(extractFromAST_1.createDocumentFromQuery(queries.definitions[0])));
                assert.include(Object.keys(result), graphql_1.print(extractFromAST_1.createDocumentFromQuery(queries.definitions[1])));
                done();
            });
        });
        it('should process a file with a fragment reference to a different file', function () {
            var expectedQuery = (_a = ["\n        query {\n          author {\n            ...details\n          }\n        }\n        fragment details on Author {\n          firstName\n          lastName\n        }\n        "], _a.raw = ["\n        query {\n          author {\n            ...details\n          }\n        }\n        fragment details on Author {\n          firstName\n          lastName\n        }\n        "], graphql_tag_1.default(_a));
            return egql.processInputPath('./test/fixtures/single_fragment').then(function (result) {
                var keys = Object.keys(result);
                assert.equal(keys.length, 1);
                assert.include(Object.keys(result), graphql_1.print(expectedQuery));
            });
            var _a;
        });
        it('should process a JS file with queries', function () {
            var expectedQuery = (_a = ["\n        query {\n          author {\n            ...details\n          }\n        }\n        fragment details on Author {\n          firstName\n          lastName\n        }\n        "], _a.raw = ["\n        query {\n          author {\n            ...details\n          }\n        }\n        fragment details on Author {\n          firstName\n          lastName\n        }\n        "], graphql_tag_1.default(_a));
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
                assert.equal(keys[0], graphql_1.print(expectedQuery));
            });
            var _a;
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
            var query = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a));
            var transformedQuery = (_b = ["\n        query {\n          author {\n            firstName\n            lastName\n            __typename\n          }\n        }"], _b.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n            __typename\n          }\n        }"], graphql_tag_1.default(_b));
            var myegql = new ExtractGQL_1.ExtractGQL({
                inputFilePath: "---",
                queryTransformers: [queryTransformers_1.addTypenameTransformer],
            });
            assert.equal(myegql.getQueryKey(query.definitions[0]), graphql_1.print(transformedQuery.definitions[0]));
            var _a, _b;
        });
    });
    var _a;
});
//# sourceMappingURL=index.js.map
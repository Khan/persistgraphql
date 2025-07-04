"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var assert = chai.assert;
var graphql_1 = require("graphql");
var graphql_tag_1 = require("graphql-tag");
var fetchMock = require("fetch-mock");
var _ = require('lodash');
var graphql_2 = require("graphql");
var common_1 = require("../../src/common");
var ApolloNetworkInterface_1 = require("../../src/network_interface/ApolloNetworkInterface");
var ExtractGQL_1 = require("../../src/ExtractGQL");
describe('PersistedQueryNetworkInterface', function () {
    it('should construct itself', function () {
        var pni = new ApolloNetworkInterface_1.PersistedQueryNetworkInterface({
            uri: 'http://fake.com/fake',
            queryMap: {},
        });
        assert.equal(pni._uri, 'http://fake.com/fake');
        assert.deepEqual(pni._opts, {});
        assert.deepEqual(pni.queryMap, {});
    });
    it('should not use query mapping when enablePersistedQueries = false', function (done) {
        var fetchUri = 'http://fake.com/fake';
        var query = (0, graphql_tag_1.default)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["query { author }"], ["query { author }"])));
        fetchMock.post(fetchUri, function (url, opts) {
            var requestQuery = (0, graphql_2.parse)(JSON.parse(opts.body.toString()).query);
            assert.equal((0, graphql_1.print)(requestQuery), (0, graphql_1.print)(query));
            fetchMock.restore();
            done();
            return null;
        });
        var pni = new ApolloNetworkInterface_1.PersistedQueryNetworkInterface({
            uri: fetchUri,
            queryMap: {},
            enablePersistedQueries: false,
        });
        pni.query({ query: query });
    });
    it('should fail to work when asked to lookup nonmapped query', function (done) {
        var pni = new ApolloNetworkInterface_1.PersistedQueryNetworkInterface({
            uri: 'http://fake.com/fake',
            queryMap: {},
        });
        var request = {
            query: (0, graphql_tag_1.default)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "], ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "]))),
        };
        pni.query(request).then(function () {
            done(new Error('Result resolved when it should not have.'));
        }).catch(function (err) {
            assert(err);
            assert.include(err.message, 'Could not find');
            done();
        });
    });
    describe('sending query ids', function () {
        var egql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'nothing' });
        var queriesDocument = (0, graphql_tag_1.default)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n      query {\n        person {\n          ...personDetails\n        }\n      }\n      query {\n        house {\n          address\n        }\n      }\n      query {\n        person(id: $id) {\n          name\n        }\n      }\n      query ListOfAuthors {\n        author {\n          firstName\n          lastName\n        }\n      }\n      mutation changeAuthorStuff {\n        firstName\n        lastName\n      }\n      fragment personDetails on Person {\n        firstName\n        lastName\n      }\n    "], ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n      query {\n        person {\n          ...personDetails\n        }\n      }\n      query {\n        house {\n          address\n        }\n      }\n      query {\n        person(id: $id) {\n          name\n        }\n      }\n      query ListOfAuthors {\n        author {\n          firstName\n          lastName\n        }\n      }\n      mutation changeAuthorStuff {\n        firstName\n        lastName\n      }\n      fragment personDetails on Person {\n        firstName\n        lastName\n      }\n    "])));
        var simpleQueryRequest = {
            id: 1,
        };
        var simpleQueryData = {
            author: {
                firstName: 'John',
                lastName: 'Smith',
            },
        };
        var fragmentQueryRequest = {
            id: 2,
        };
        var fragmentQueryData = {
            person: {
                firstName: 'Jane',
                lastName: 'Smith',
            },
        };
        var errorQueryRequest = {
            id: 3,
        };
        var errorQueryData = {
            house: {
                address: null,
            },
        };
        var errorQueryError = new Error('Could not compute error.');
        var idVariableValue = '1';
        var variableQueryRequest = {
            id: 4,
            variables: { id: idVariableValue },
        };
        var variableQueryData = {
            person: {
                name: 'Dhaivat Pandya',
            },
        };
        var operationNameQueryRequest = {
            operationName: 'ListOfAuthors',
            id: 5,
        };
        var operationNameQueryData = {
            author: [
                { name: 'Adam Smith' },
                { name: 'Thomas Piketty' },
            ],
        };
        var mutationRequest = {
            id: 6,
        };
        var mutationData = {
            firstName: 'John',
            lastName: 'Smith',
        };
        var queryMap = egql.createMapFromDocument(queriesDocument);
        var uri = 'http://fake.com/fakegraphql';
        var pni = new ApolloNetworkInterface_1.PersistedQueryNetworkInterface({
            uri: uri,
            queryMap: queryMap,
        });
        before(function () {
            fetchMock.post(uri, function (url, opts) {
                var receivedObject = JSON.parse(opts.body.toString());
                if (_.isEqual(receivedObject, simpleQueryRequest)) {
                    return { data: simpleQueryData };
                }
                else if (_.isEqual(receivedObject, fragmentQueryRequest)) {
                    return { data: fragmentQueryData };
                }
                else if (_.isEqual(receivedObject, errorQueryRequest)) {
                    return { data: errorQueryData, errors: [errorQueryError] };
                }
                else if (_.isEqual(receivedObject, variableQueryRequest)) {
                    return { data: variableQueryData };
                }
                else if (_.isEqual(receivedObject, operationNameQueryRequest)) {
                    return { data: operationNameQueryData };
                }
                else if (_.isEqual(receivedObject, mutationRequest)) {
                    return { data: mutationData };
                }
                else {
                    throw new Error('Received unmatched request in mock fetch.');
                }
            });
        });
        after(function () {
            fetchMock.restore();
        });
        it('should work for a single, no fragment query', function (done) {
            pni.query({
                query: (0, graphql_tag_1.default)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"]))),
            }).then(function (result) {
                assert.deepEqual(result.data, simpleQueryData);
                done();
            }).catch(function (error) {
                done(error);
            });
        });
        it('should work for a query with a fragment', function (done) {
            pni.query({
                query: (0, graphql_tag_1.default)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n          query {\n            person {\n              ...personDetails\n            }\n          }\n\n          fragment personDetails on Person {\n            firstName\n            lastName\n          }\n      "], ["\n          query {\n            person {\n              ...personDetails\n            }\n          }\n\n          fragment personDetails on Person {\n            firstName\n            lastName\n          }\n      "])))
            }).then(function (result) {
                assert.deepEqual(result.data, fragmentQueryData);
                done();
            });
        });
        it('should work for a query that returns an error', function (done) {
            pni.query({
                query: (0, graphql_tag_1.default)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n          query {\n            house {\n              address\n            }\n          }\n        "], ["\n          query {\n            house {\n              address\n            }\n          }\n        "]))),
            }).then(function (result) {
                assert.deepEqual(result.data, errorQueryData);
                assert.deepEqual(result.errors.length, 1);
                assert.deepEqual(result.errors[0], errorQueryError);
                done();
            });
        });
        it('should pass along variables to the server', function (done) {
            pni.query({
                query: (0, graphql_tag_1.default)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n          query {\n            person(id: $id) {\n              name\n            }\n          }"], ["\n          query {\n            person(id: $id) {\n              name\n            }\n          }"]))),
                variables: { id: idVariableValue },
            }).then(function (result) {
                assert.deepEqual(result.data, variableQueryData);
                done();
            });
        });
        it('should pass along the operation name to the server', function (done) {
            pni.query({
                query: (0, graphql_tag_1.default)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n          query ListOfAuthors {\n            author {\n              firstName\n              lastName\n            }\n          }"], ["\n          query ListOfAuthors {\n            author {\n              firstName\n              lastName\n            }\n          }"]))),
                operationName: 'ListOfAuthors',
            }).then(function (result) {
                assert.deepEqual(result.data, operationNameQueryData);
                done();
            });
        });
        it('should also work with mutations', function (done) {
            pni.query({
                query: (0, graphql_tag_1.default)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n          mutation changeAuthorStuff {\n            firstName\n            lastName\n          }"], ["\n          mutation changeAuthorStuff {\n            firstName\n            lastName\n          }"]))),
            }).then(function (result) {
                assert.deepEqual(result.data, mutationData);
                done();
            });
        });
    });
});
describe('addPersistedQueries', function () {
    var GenericNetworkInterface = (function () {
        function GenericNetworkInterface() {
        }
        GenericNetworkInterface.prototype.query = function (originalQuery) {
            return Promise.resolve(originalQuery);
        };
        return GenericNetworkInterface;
    }());
    var egql = new ExtractGQL_1.ExtractGQL({ inputFilePath: 'nothing' });
    var queriesDocument = (0, graphql_tag_1.default)(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n    query {\n      author {\n        firstName\n        lastName\n      }\n    }\n  "], ["\n    query {\n      author {\n        firstName\n        lastName\n      }\n    }\n  "])));
    var queryMap = egql.createMapFromDocument(queriesDocument);
    var request = {
        query: (0, graphql_tag_1.default)(templateObject_11 || (templateObject_11 = __makeTemplateObject(["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n    "], ["\n      query {\n        author {\n          firstName\n          lastName\n        }\n      }\n    "]))),
        variables: {
            id: '1',
        },
        operationName: '2',
    };
    it('should error with an unmapped query', function (done) {
        var networkInterface = new GenericNetworkInterface();
        (0, ApolloNetworkInterface_1.addPersistedQueries)(networkInterface, {});
        networkInterface.query(request).then(function () {
            done(new Error('Should not resolve'));
        }).catch(function (err) {
            assert(err);
            assert.include(err.message, 'Could not find');
            done();
        });
    });
    it('should pass through a query with the persisted query id', function () {
        var networkInterface = new GenericNetworkInterface();
        (0, ApolloNetworkInterface_1.addPersistedQueries)(networkInterface, queryMap);
        var expectedId = queryMap[(0, common_1.getQueryDocumentKey)(request.query)];
        return networkInterface.query(request).then(function (persistedQuery) {
            var id = persistedQuery.id;
            var variables = persistedQuery.variables;
            var operationName = persistedQuery.operationName;
            assert(id === expectedId, 'returned query id should equal expected document key');
            assert(variables.id === '1', 'should pass through variables property');
            assert(operationName === '2', 'should pass through operation name');
        });
    });
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11;
//# sourceMappingURL=ApolloNetworkInterface.js.map
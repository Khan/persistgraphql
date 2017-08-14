"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var assert = chai.assert;
var extractFromAST_1 = require("../src/extractFromAST");
var graphql_tag_1 = require("graphql-tag");
var graphql_1 = require("graphql");
describe('extractFromAST', function () {
    describe('getFragmentNames', function () {
        it('should extract the fragment names from top level references', function () {
            var document = (_a = ["\n        query {\n          ...rootDetails\n          ...otherRootDetails\n        }\n        fragment rootDetails on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment otherRootDetails on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }\n        "], _a.raw = ["\n        query {\n          ...rootDetails\n          ...otherRootDetails\n        }\n        fragment rootDetails on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment otherRootDetails on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }\n        "], graphql_tag_1.default(_a));
            var fragmentNames = extractFromAST_1.getFragmentNames(document.definitions[0].selectionSet, document);
            assert.deepEqual(fragmentNames, {
                'rootDetails': 1,
                'otherRootDetails': 1,
            });
            var _a;
        });
        it('should extract the fragment names from deep references', function () {
            var document = (_a = ["\n        query {\n          author {\n            name {\n              ...nameInfo\n            }\n            ...generalAuthorInfo\n          }\n        }\n        fragment nameInfo on Name {\n          firstName\n          lastName\n        }\n        fragment generalAuthorInfo on Author {\n          age\n        }\n      "], _a.raw = ["\n        query {\n          author {\n            name {\n              ...nameInfo\n            }\n            ...generalAuthorInfo\n          }\n        }\n        fragment nameInfo on Name {\n          firstName\n          lastName\n        }\n        fragment generalAuthorInfo on Author {\n          age\n        }\n      "], graphql_tag_1.default(_a));
            var fragmentNames = extractFromAST_1.getFragmentNames(document.definitions[0].selectionSet, document);
            assert.deepEqual(fragmentNames, {
                nameInfo: 1,
                generalAuthorInfo: 1,
            });
            var _a;
        });
        it('should extract fragment names referenced in fragments', function () {
            var document = (_a = ["\n        query {\n          author {\n            name {\n              ...nameInfo\n            }\n          }\n        }\n        fragment nameInfo on Name {\n          firstName\n          ...otherNameInfo\n        }\n        fragment otherNameInfo on Name {\n          otherThing {\n            lastName\n          }\n        }\n      "], _a.raw = ["\n        query {\n          author {\n            name {\n              ...nameInfo\n            }\n          }\n        }\n        fragment nameInfo on Name {\n          firstName\n          ...otherNameInfo\n        }\n        fragment otherNameInfo on Name {\n          otherThing {\n            lastName\n          }\n        }\n      "], graphql_tag_1.default(_a));
            var fragmentNames = extractFromAST_1.getFragmentNames(document.definitions[0].selectionSet, document);
            assert.deepEqual(fragmentNames, {
                nameInfo: 1,
                otherNameInfo: 1,
            });
            var _a;
        });
    });
    describe('getQueryDefinitions', function () {
        it('should extract query definitions out of a document containing multiple queries', function () {
            var document = (_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n        query {\n          person {\n            name\n          }\n        }\n        mutation createRandomAuthor {\n          name\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n        query {\n          person {\n            name\n          }\n        }\n        mutation createRandomAuthor {\n          name\n        }"], graphql_tag_1.default(_a));
            var query1 = (_b = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "], _b.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "], graphql_tag_1.default(_b));
            var query2 = (_c = ["\n        query {\n          person {\n            name\n          }\n        }"], _c.raw = ["\n        query {\n          person {\n            name\n          }\n        }"], graphql_tag_1.default(_c));
            var queries = extractFromAST_1.getQueryDefinitions(document);
            assert.equal(queries.length, 2);
            assert.equal(graphql_1.print(queries[0]), graphql_1.print(query1.definitions[0]));
            assert.equal(graphql_1.print(queries[1]), graphql_1.print(query2.definitions[0]));
            var _a, _b, _c;
        });
    });
});
//# sourceMappingURL=extractFromAST.js.map
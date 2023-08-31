"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var assert = chai.assert;
var extractFromAST_1 = require("../src/extractFromAST");
var graphql_tag_1 = require("graphql-tag");
var graphql_1 = require("graphql");
describe('extractFromAST', function () {
    describe('getFragmentNames', function () {
        it('should extract the fragment names from top level references', function () {
            var document = (0, graphql_tag_1.default)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        query {\n          ...rootDetails\n          ...otherRootDetails\n        }\n        fragment rootDetails on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment otherRootDetails on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }\n        "], ["\n        query {\n          ...rootDetails\n          ...otherRootDetails\n        }\n        fragment rootDetails on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }\n        fragment otherRootDetails on RootQuery {\n          author {\n            firstName\n            lastName\n          }\n        }\n        "])));
            var fragmentNames = (0, extractFromAST_1.getFragmentNames)(document.definitions[0].selectionSet, document);
            assert.deepEqual(fragmentNames, {
                'rootDetails': 1,
                'otherRootDetails': 1,
            });
        });
        it('should extract the fragment names from deep references', function () {
            var document = (0, graphql_tag_1.default)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n        query {\n          author {\n            name {\n              ...nameInfo\n            }\n            ...generalAuthorInfo\n          }\n        }\n        fragment nameInfo on Name {\n          firstName\n          lastName\n        }\n        fragment generalAuthorInfo on Author {\n          age\n        }\n      "], ["\n        query {\n          author {\n            name {\n              ...nameInfo\n            }\n            ...generalAuthorInfo\n          }\n        }\n        fragment nameInfo on Name {\n          firstName\n          lastName\n        }\n        fragment generalAuthorInfo on Author {\n          age\n        }\n      "])));
            var fragmentNames = (0, extractFromAST_1.getFragmentNames)(document.definitions[0].selectionSet, document);
            assert.deepEqual(fragmentNames, {
                nameInfo: 1,
                generalAuthorInfo: 1,
            });
        });
        it('should extract fragment names referenced in fragments', function () {
            var document = (0, graphql_tag_1.default)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n        query {\n          author {\n            name {\n              ...nameInfo\n            }\n          }\n        }\n        fragment nameInfo on Name {\n          firstName\n          ...otherNameInfo\n        }\n        fragment otherNameInfo on Name {\n          otherThing {\n            lastName\n          }\n        }\n      "], ["\n        query {\n          author {\n            name {\n              ...nameInfo\n            }\n          }\n        }\n        fragment nameInfo on Name {\n          firstName\n          ...otherNameInfo\n        }\n        fragment otherNameInfo on Name {\n          otherThing {\n            lastName\n          }\n        }\n      "])));
            var fragmentNames = (0, extractFromAST_1.getFragmentNames)(document.definitions[0].selectionSet, document);
            assert.deepEqual(fragmentNames, {
                nameInfo: 1,
                otherNameInfo: 1,
            });
        });
    });
    describe('getQueryDefinitions', function () {
        it('should extract query definitions out of a document containing multiple queries', function () {
            var document = (0, graphql_tag_1.default)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n        query {\n          person {\n            name\n          }\n        }\n        mutation createRandomAuthor {\n          name\n        }"], ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n        query {\n          person {\n            name\n          }\n        }\n        mutation createRandomAuthor {\n          name\n        }"])));
            var query1 = (0, graphql_tag_1.default)(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "], ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }\n      "])));
            var query2 = (0, graphql_tag_1.default)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n        query {\n          person {\n            name\n          }\n        }"], ["\n        query {\n          person {\n            name\n          }\n        }"])));
            var queries = (0, extractFromAST_1.getQueryDefinitions)(document);
            assert.equal(queries.length, 2);
            assert.equal((0, graphql_1.print)(queries[0]), (0, graphql_1.print)(query1.definitions[0]));
            assert.equal((0, graphql_1.print)(queries[1]), (0, graphql_1.print)(query2.definitions[0]));
        });
    });
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
//# sourceMappingURL=extractFromAST.js.map
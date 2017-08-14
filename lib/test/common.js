"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var assert = chai.assert;
var common_1 = require("../src/common");
var graphql_1 = require("graphql");
var graphql_tag_1 = require("graphql-tag");
describe('common methods', function () {
    describe('sortFragmentsByName', function () {
        var queryDoc1 = (_a = ["\n      query { field }\n    "], _a.raw = ["\n      query { field }\n    "], graphql_tag_1.default(_a));
        var queryDoc2 = (_b = ["\n      query { root }\n    "], _b.raw = ["\n      query { root }\n    "], graphql_tag_1.default(_b));
        var fragmentDoc1 = (_c = ["\n      fragment details on Author {\n        name\n      }"], _c.raw = ["\n      fragment details on Author {\n        name\n      }"], graphql_tag_1.default(_c));
        var fragmentDoc2 = (_d = ["\n      fragment info on Author {\n        name {\n          firstName\n          lastName\n        }  \n      }"], _d.raw = ["\n      fragment info on Author {\n        name {\n          firstName\n          lastName\n        }  \n      }"], graphql_tag_1.default(_d));
        var queryDef1 = queryDoc1.definitions[0];
        var queryDef2 = queryDoc2.definitions[0];
        var fragmentDef1 = fragmentDoc1.definitions[0];
        var fragmentDef2 = fragmentDoc2.definitions[0];
        it('should return 0 if both args are not a fragment', function () {
            assert.equal(common_1.sortFragmentsByName(queryDef1, queryDef2), 0);
        });
        it('should return 1 if the first arg is a fragment and the second isn not', function () {
            assert.equal(common_1.sortFragmentsByName(fragmentDef1, queryDef1), 1);
        });
        it('should return -1 if the second arg is a fragment and the first arg is not', function () {
            assert.equal(common_1.sortFragmentsByName(queryDef2, fragmentDef2), -1);
        });
        it('correctly orders fragments by name', function () {
            assert.equal(common_1.sortFragmentsByName(fragmentDef1, fragmentDef2), -1);
            assert.equal(common_1.sortFragmentsByName(fragmentDef2, fragmentDef1), 1);
        });
        var _a, _b, _c, _d;
    });
    describe('applyFragmentDefinitionSort', function () {
        it('leaves presorted doc unaltered', function () {
            var doc = (_a = [" \n        query { root }\n        fragment details on Author { name }"], _a.raw = [" \n        query { root }\n        fragment details on Author { name }"], graphql_tag_1.default(_a));
            assert.equal(common_1.applyFragmentDefinitionSort(doc), doc);
            var _a;
        });
        it('moves fragment defintions to the end of the doc', function () {
            var doc = (_a = ["\n        fragment details on Author { name }\n        query { root }"], _a.raw = ["\n        fragment details on Author { name }\n        query { root }"], graphql_tag_1.default(_a));
            var result = (_b = ["\n        query { root }\n        fragment details on Author { name }"], _b.raw = ["\n        query { root }\n        fragment details on Author { name }"], graphql_tag_1.default(_b));
            assert.deepEqual(graphql_1.print(common_1.applyFragmentDefinitionSort(doc)), graphql_1.print(result));
            var _a, _b;
        });
        it('sorts fragments and moves them to the end of the doc', function () {
            var doc = (_a = ["\n        fragment d on Author { x } \n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment a on Author { x }\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }"], _a.raw = ["\n        fragment d on Author { x } \n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment a on Author { x }\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }"], graphql_tag_1.default(_a));
            var result = (_b = ["\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }\n        fragment a on Author { x }\n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment d on Author { x }"], _b.raw = ["\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }\n        fragment a on Author { x }\n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment d on Author { x }"], graphql_tag_1.default(_b));
            assert.equal(graphql_1.print(common_1.applyFragmentDefinitionSort(doc)), graphql_1.print(doc));
            var _a, _b;
        });
    });
});
//# sourceMappingURL=common.js.map
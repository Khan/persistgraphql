"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var assert = chai.assert;
var common_1 = require("../src/common");
var graphql_1 = require("graphql");
var graphql_tag_1 = require("graphql-tag");
describe('common methods', function () {
    describe('sortFragmentsByName', function () {
        var queryDoc1 = (0, graphql_tag_1.default)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      query { field }\n    "], ["\n      query { field }\n    "])));
        var queryDoc2 = (0, graphql_tag_1.default)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n      query { root }\n    "], ["\n      query { root }\n    "])));
        var fragmentDoc1 = (0, graphql_tag_1.default)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n      fragment details on Author {\n        name\n      }"], ["\n      fragment details on Author {\n        name\n      }"])));
        var fragmentDoc2 = (0, graphql_tag_1.default)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n      fragment info on Author {\n        name {\n          firstName\n          lastName\n        }  \n      }"], ["\n      fragment info on Author {\n        name {\n          firstName\n          lastName\n        }  \n      }"])));
        var queryDef1 = queryDoc1.definitions[0];
        var queryDef2 = queryDoc2.definitions[0];
        var fragmentDef1 = fragmentDoc1.definitions[0];
        var fragmentDef2 = fragmentDoc2.definitions[0];
        it('should return 0 if both args are not a fragment', function () {
            assert.equal((0, common_1.sortFragmentsByName)(queryDef1, queryDef2), 0);
        });
        it('should return 1 if the first arg is a fragment and the second isn not', function () {
            assert.equal((0, common_1.sortFragmentsByName)(fragmentDef1, queryDef1), 1);
        });
        it('should return -1 if the second arg is a fragment and the first arg is not', function () {
            assert.equal((0, common_1.sortFragmentsByName)(queryDef2, fragmentDef2), -1);
        });
        it('correctly orders fragments by name', function () {
            assert.equal((0, common_1.sortFragmentsByName)(fragmentDef1, fragmentDef2), -1);
            assert.equal((0, common_1.sortFragmentsByName)(fragmentDef2, fragmentDef1), 1);
        });
    });
    describe('applyFragmentDefinitionSort', function () {
        it('leaves presorted doc unaltered', function () {
            var doc = (0, graphql_tag_1.default)(templateObject_5 || (templateObject_5 = __makeTemplateObject([" \n        query { root }\n        fragment details on Author { name }"], [" \n        query { root }\n        fragment details on Author { name }"])));
            assert.equal((0, common_1.applyFragmentDefinitionSort)(doc), doc);
        });
        it('moves fragment defintions to the end of the doc', function () {
            var doc = (0, graphql_tag_1.default)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n        fragment details on Author { name }\n        query { root }"], ["\n        fragment details on Author { name }\n        query { root }"])));
            var result = (0, graphql_tag_1.default)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n        query { root }\n        fragment details on Author { name }"], ["\n        query { root }\n        fragment details on Author { name }"])));
            assert.deepEqual((0, graphql_1.print)((0, common_1.applyFragmentDefinitionSort)(doc)), (0, graphql_1.print)(result));
        });
        it('sorts fragments and moves them to the end of the doc', function () {
            var doc = (0, graphql_tag_1.default)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n        fragment d on Author { x } \n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment a on Author { x }\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }"], ["\n        fragment d on Author { x } \n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment a on Author { x }\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }"])));
            var result = (0, graphql_tag_1.default)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }\n        fragment a on Author { x }\n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment d on Author { x }"], ["\n        query { \n          ...a\n          ...b\n          ...c\n          ...d\n        }\n        fragment a on Author { x }\n        fragment b on Author { x }\n        fragment c on Author { x } \n        fragment d on Author { x }"])));
            assert.equal((0, graphql_1.print)((0, common_1.applyFragmentDefinitionSort)(doc)), (0, graphql_1.print)(doc));
        });
    });
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9;
//# sourceMappingURL=common.js.map
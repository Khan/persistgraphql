"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var assert = chai.assert;
var graphql_tag_1 = require("graphql-tag");
var graphql_1 = require("graphql");
var queryTransformers_1 = require("../src/queryTransformers");
describe('query transformers', function () {
    describe('typename query transformer', function () {
        var assertTransform = function (inputQuery, expected) {
            assert.equal((0, graphql_1.print)((0, queryTransformers_1.addTypenameTransformer)(inputQuery)), (0, graphql_1.print)(expected));
        };
        it('should add __typename to all the levels of a simple query', function () {
            assertTransform((0, graphql_tag_1.default)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"]))), (0, graphql_tag_1.default)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n        query {\n          author {\n            firstName\n            lastName\n            __typename\n          }\n        }"], ["\n        query {\n          author {\n            firstName\n            lastName\n            __typename\n          }\n        }"]))));
        });
        it('should add __typename to a multiple level nested query with inlined fragments', function () {
            assertTransform((0, graphql_tag_1.default)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n        query {\n          person {\n            name {\n              ... on Name {\n                firstName\n                lastName\n              }\n            }\n            address {\n              ... on Address {\n                zipcode\n              }\n            }\n          }\n       }"], ["\n        query {\n          person {\n            name {\n              ... on Name {\n                firstName\n                lastName\n              }\n            }\n            address {\n              ... on Address {\n                zipcode\n              }\n            }\n          }\n       }"]))), (0, graphql_tag_1.default)(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n       query {\n          person {\n            name {\n              ... on Name {\n                firstName\n                lastName\n                __typename\n              }\n              __typename\n            }\n            address {\n              ... on Address {\n                zipcode\n                __typename\n              }\n              __typename\n            }\n            __typename\n         }\n       }"], ["\n       query {\n          person {\n            name {\n              ... on Name {\n                firstName\n                lastName\n                __typename\n              }\n              __typename\n            }\n            address {\n              ... on Address {\n                zipcode\n                __typename\n              }\n              __typename\n            }\n            __typename\n         }\n       }"]))));
        });
    });
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=queryTransformers.js.map
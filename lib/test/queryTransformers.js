"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var assert = chai.assert;
var graphql_tag_1 = require("graphql-tag");
var graphql_1 = require("graphql");
var queryTransformers_1 = require("../src/queryTransformers");
describe('query transformers', function () {
    describe('typename query transformer', function () {
        var assertTransform = function (inputQuery, expected) {
            assert.equal(graphql_1.print(queryTransformers_1.addTypenameTransformer(inputQuery)), graphql_1.print(expected));
        };
        it('should add __typename to all the levels of a simple query', function () {
            assertTransform((_a = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], _a.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n          }\n        }"], graphql_tag_1.default(_a)), (_b = ["\n        query {\n          author {\n            firstName\n            lastName\n            __typename\n          }\n        }"], _b.raw = ["\n        query {\n          author {\n            firstName\n            lastName\n            __typename\n          }\n        }"], graphql_tag_1.default(_b)));
            var _a, _b;
        });
        it('should add __typename to a multiple level nested query with inlined fragments', function () {
            assertTransform((_a = ["\n        query {\n          person {\n            name {\n              ... on Name {\n                firstName\n                lastName\n              }\n            }\n            address {\n              ... on Address {\n                zipcode\n              }\n            }\n          }\n       }"], _a.raw = ["\n        query {\n          person {\n            name {\n              ... on Name {\n                firstName\n                lastName\n              }\n            }\n            address {\n              ... on Address {\n                zipcode\n              }\n            }\n          }\n       }"], graphql_tag_1.default(_a)), (_b = ["\n       query {\n          person {\n            name {\n              ... on Name {\n                firstName\n                lastName\n                __typename\n              }\n              __typename\n            }\n            address {\n              ... on Address {\n                zipcode\n                __typename\n              }\n              __typename\n            }\n            __typename\n         }\n       }"], _b.raw = ["\n       query {\n          person {\n            name {\n              ... on Name {\n                firstName\n                lastName\n                __typename\n              }\n              __typename\n            }\n            address {\n              ... on Address {\n                zipcode\n                __typename\n              }\n              __typename\n            }\n            __typename\n         }\n       }"], graphql_tag_1.default(_b)));
            var _a, _b;
        });
    });
});
//# sourceMappingURL=queryTransformers.js.map
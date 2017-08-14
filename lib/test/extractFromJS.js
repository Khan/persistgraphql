"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var assert = chai.assert;
var extractFromJS_1 = require("../src/extractFromJS");
describe('extractFromJS', function () {
    it('should be able to find tagged strings inside JS', function () {
        var jsFile = "\n      // Single line\n      const query = gql`xxx`;\n\n      // Multi line\n      const query2 = gql`y\ny\ny`;\n\n      // Has a space before tag\n      const query3 = gql `zzz`;\n    ";
        assert.deepEqual(extractFromJS_1.findTaggedTemplateLiteralsInJS(jsFile, 'gql'), [
            'xxx',
            'y\ny\ny',
            'zzz',
        ]);
    });
    it('should eliminate interpolations', function () {
        var contents = "\n      {\n        a { b ...c }\n      }\n${c}\n    ";
        assert.deepEqual(extractFromJS_1.eliminateInterpolations(contents), "\n      {\n        a { b ...c }\n      }\n\n    ");
    });
});
//# sourceMappingURL=extractFromJS.js.map
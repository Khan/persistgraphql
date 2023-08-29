"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTypenameTransformer = void 0;
var graphql_1 = require("graphql");
var TYPENAME_FIELD = {
    kind: graphql_1.Kind.FIELD,
    alias: null,
    name: {
        kind: graphql_1.Kind.NAME,
        value: '__typename',
    },
};
function addTypenameToSelectionSet(selectionSet, isRoot) {
    if (isRoot === void 0) { isRoot = false; }
    if (selectionSet.selections) {
        if (!isRoot) {
            var alreadyHasThisField = selectionSet.selections.some(function (selection) {
                return selection.kind === 'Field' && selection.name.value === '__typename';
            });
            if (!alreadyHasThisField) {
                selectionSet.selections.push(TYPENAME_FIELD);
            }
        }
        selectionSet.selections.forEach(function (selection) {
            if (selection.kind === 'Field' || selection.kind === 'InlineFragment') {
                if (selection.selectionSet) {
                    addTypenameToSelectionSet(selection.selectionSet);
                }
            }
        });
    }
}
var addTypenameTransformer = function (doc) {
    doc.definitions.forEach(function (definition) {
        var isRoot = definition.kind === 'OperationDefinition';
        addTypenameToSelectionSet(definition.selectionSet, isRoot);
    });
    return doc;
};
exports.addTypenameTransformer = addTypenameTransformer;
//# sourceMappingURL=queryTransformers.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPersistedQueries = exports.PersistedQueryNetworkInterface = exports.addTypenameTransformer = exports.ExtractGQL = void 0;
var ExtractGQL_1 = require("./src/ExtractGQL");
Object.defineProperty(exports, "ExtractGQL", { enumerable: true, get: function () { return ExtractGQL_1.ExtractGQL; } });
var queryTransformers_1 = require("./src/queryTransformers");
Object.defineProperty(exports, "addTypenameTransformer", { enumerable: true, get: function () { return queryTransformers_1.addTypenameTransformer; } });
var ApolloNetworkInterface_1 = require("./src/network_interface/ApolloNetworkInterface");
Object.defineProperty(exports, "PersistedQueryNetworkInterface", { enumerable: true, get: function () { return ApolloNetworkInterface_1.PersistedQueryNetworkInterface; } });
Object.defineProperty(exports, "addPersistedQueries", { enumerable: true, get: function () { return ApolloNetworkInterface_1.addPersistedQueries; } });
//# sourceMappingURL=index.js.map
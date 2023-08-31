"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPersistedQueries = exports.PersistedQueryNetworkInterface = void 0;
var apollo_client_1 = require("apollo-client");
var common_1 = require("../common");
var PersistedQueryNetworkInterface = (function (_super) {
    __extends(PersistedQueryNetworkInterface, _super);
    function PersistedQueryNetworkInterface(_a) {
        var _b = _a.enablePersistedQueries, enablePersistedQueries = _b === void 0 ? true : _b, uri = _a.uri, queryMap = _a.queryMap, _c = _a.opts, opts = _c === void 0 ? {} : _c;
        var _this = _super.call(this, uri, opts) || this;
        _this.queryMap = {};
        _this._uri = uri;
        _this._opts = opts;
        _this.queryMap = queryMap;
        _this.enablePersistedQueries = enablePersistedQueries;
        if (enablePersistedQueries) {
            addPersistedQueries(_this, queryMap);
        }
        return _this;
    }
    return PersistedQueryNetworkInterface;
}(apollo_client_1.HTTPFetchNetworkInterface));
exports.PersistedQueryNetworkInterface = PersistedQueryNetworkInterface;
function addPersistedQueries(networkInterface, queryMap) {
    var _query = networkInterface.query.bind(networkInterface);
    return Object.assign(networkInterface, {
        query: function (request) {
            var queryDocument = request.query;
            var queryKey = (0, common_1.getQueryDocumentKey)(queryDocument);
            if (!queryMap[queryKey]) {
                return Promise.reject(new Error('Could not find query inside query map.'));
            }
            var serverRequest = {
                id: queryMap[queryKey],
                variables: request.variables,
                operationName: request.operationName,
            };
            return _query(serverRequest);
        },
    });
}
exports.addPersistedQueries = addPersistedQueries;
//# sourceMappingURL=ApolloNetworkInterface.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("es6-promise");
process.env.NODE_ENV = 'test';
require("./index");
require("./extractFromAST");
require("./network_interface/ApolloNetworkInterface");
require("./queryTransformers");
require("./extractFromJS");
require("./common");
//# sourceMappingURL=tests.js.map
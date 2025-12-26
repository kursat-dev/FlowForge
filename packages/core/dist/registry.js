"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeRegistry = void 0;
exports.registerNode = registerNode;
exports.nodeRegistry = {};
function registerNode(type, handler) {
    exports.nodeRegistry[type] = handler;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ValidationError extends Error {
    constructor(message) {
        super(message);
    }
}
exports.default = ValidationError;

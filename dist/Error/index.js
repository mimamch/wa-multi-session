"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappError = void 0;
class WhatsappError extends Error {
    constructor(message) {
        super(message);
        this.name = "WhatsappError";
        Object.setPrototypeOf(this, WhatsappError.prototype);
    }
    static isWhatsappError(error) {
        return error instanceof WhatsappError || error instanceof Error;
    }
}
exports.WhatsappError = WhatsappError;

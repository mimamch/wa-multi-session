"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messages = exports.CALLBACK_KEY = exports.CREDENTIALS = void 0;
var CREDENTIALS;
(function (CREDENTIALS) {
    CREDENTIALS["DIR_NAME"] = "wa_credentials";
    CREDENTIALS["PREFIX"] = "_credentials";
})(CREDENTIALS = exports.CREDENTIALS || (exports.CREDENTIALS = {}));
var CALLBACK_KEY;
(function (CALLBACK_KEY) {
    CALLBACK_KEY["ON_MESSAGE_RECEIVED"] = "on-message-received";
})(CALLBACK_KEY = exports.CALLBACK_KEY || (exports.CALLBACK_KEY = {}));
class Messages {
}
exports.Messages = Messages;
Messages.sessionAlreadyExist = (sessionId) => `Session ID :${sessionId} is already exist, Try another Session ID.`;
Messages.sessionNotFound = (sessionId) => `Session with ID: ${sessionId} Not Exist!`;
Messages.paremetersRequired = (props) => `Parameter ${typeof props == "string"
    ? props
    : props instanceof Array
        ? props.join(", ")
        : ""} is required`;

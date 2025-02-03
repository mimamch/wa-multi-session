"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCredentialsDir = void 0;
const Defaults_1 = require("../Defaults");
const setCredentialsDir = (dirname = "wa_credentials") => {
    Defaults_1.CREDENTIALS.DIR_NAME = dirname;
};
exports.setCredentialsDir = setCredentialsDir;

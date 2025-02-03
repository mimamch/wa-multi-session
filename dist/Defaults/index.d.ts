export declare abstract class CREDENTIALS {
    static DIR_NAME: string;
    static PREFIX: string;
}
export declare enum CALLBACK_KEY {
    ON_MESSAGE_RECEIVED = "on-message-received",
    ON_QR = "on-qr",
    ON_CONNECTED = "on-connected",
    ON_DISCONNECTED = "on-disconnected",
    ON_CONNECTING = "on-connecting",
    ON_MESSAGE_UPDATED = "on-message-updated",
    ON_PAIRING_CODE = "on-pairing-code"
}
export declare abstract class Messages {
    static sessionAlreadyExist: (sessionId: string) => string;
    static sessionNotFound: (sessionId: string) => string;
    static paremetersRequired: (props: string[] | string) => string;
}
//# sourceMappingURL=index.d.ts.map
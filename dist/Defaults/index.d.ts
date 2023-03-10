export declare enum CREDENTIALS {
    DIR_NAME = "wa_credentials",
    PREFIX = "_credentials"
}
export declare enum CALLBACK_KEY {
    ON_MESSAGE_RECEIVED = "on-message-received"
}
export declare abstract class Messages {
    static sessionAlreadyExist: (sessionId: string) => string;
    static sessionNotFound: (sessionId: string) => string;
    static paremetersRequired: (props: string[] | string) => string;
}

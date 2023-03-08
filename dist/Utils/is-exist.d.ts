import { SendMessageTypes } from "../Types";
export declare const isExist: ({ sessionId, to, isGroup, }: SendMessageTypes) => Promise<boolean>;

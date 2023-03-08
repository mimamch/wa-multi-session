import { proto } from "@adiwajshing/baileys";
import { SendMessageTypes } from "../Types";
export declare const sendTextMessage: ({ sessionId, to, text, isGroup, }: SendMessageTypes) => Promise<proto.WebMessageInfo | undefined>;
export declare const sendImage: ({ sessionId, to, text, isGroup, media, }: SendMessageTypes) => Promise<proto.WebMessageInfo | undefined>;
export declare const sendVideo: ({ sessionId, to, text, isGroup, media, }: SendMessageTypes) => Promise<proto.WebMessageInfo | undefined>;

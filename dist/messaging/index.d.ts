import { proto } from "@adiwajshing/baileys";
import { SendMessageTypes } from "../Types";
export declare const sendTextMessage: ({ sessionId, to, text, isGroup, }: SendMessageTypes) => Promise<proto.WebMessageInfo | undefined>;

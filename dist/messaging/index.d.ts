import { proto } from "@adiwajshing/baileys";
import { SendMediaTypes, SendMessageTypes, SendReadTypes, SendTypingTypes } from "../Types";
export declare const sendTextMessage: ({ sessionId, to, text, isGroup, ...props }: SendMessageTypes) => Promise<proto.WebMessageInfo | undefined>;
export declare const sendImage: ({ sessionId, to, text, isGroup, media, ...props }: SendMediaTypes) => Promise<proto.WebMessageInfo | undefined>;
export declare const sendVideo: ({ sessionId, to, text, isGroup, media, ...props }: SendMediaTypes) => Promise<proto.WebMessageInfo | undefined>;
/**
 * Give typing effect to target
 *
 * Looks like human typing
 *
 *
 * @param sessionId - Session ID
 * @param to - Target
 * @param duration - Duration in miliseconds typing effect will appear
 */
export declare const sendTyping: ({ sessionId, to, duration, isGroup, }: SendTypingTypes) => Promise<void>;
/**
 * Give typing effect to target
 *
 * Looks like human typing
 *
 *
 * @param sessionId - Session ID
 * @param to - Target
 * @param duration - Duration in miliseconds typing effect will appear
 */
export declare const readMessage: ({ sessionId, key }: SendReadTypes) => Promise<void>;

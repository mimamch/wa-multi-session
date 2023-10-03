import { WAMessageUpdate, proto } from "@adiwajshing/baileys";

export interface SendMessageTypes {
  to: string | number;
  text?: string;
  sessionId: string;
  isGroup?: boolean;
  answering?: proto.IWebMessageInfo;
}

export interface SendMediaTypes extends SendMessageTypes {
  media?: string | Buffer;
}
export interface SendTypingTypes extends SendMessageTypes {
  duration: number;
}
export interface SendReadTypes {
  sessionId: string;
  key: proto.IMessageKey;
}

export interface MessageReceived extends proto.IWebMessageInfo {
  /**
   * Your Session ID
   */
  sessionId: string;

  /**
   * @param path save image location path with extension
   * @example "./myimage.jpg"
   */
  saveImage: (path: string) => Promise<void>;
  /**
   * @param path save video location path with extension
   * @example "./myvideo.mp4"
   */
  saveVideo: (path: string) => Promise<void>;
  /**
   * @param path save image location path without extension
   * @example "./mydocument"
   */
  saveDocument: (path: string) => Promise<void>;
}

export interface StartSessionParams {
  /**
   * This pairing number is input for connection data using code 
   * If pairing is filled in then the data that will be displayed is the OTP to connect WhatsApp to the IWebMessageInfo
   * If the pairing number is not filled in, it will display a QR code on the terminal or in the function to display QR code buffer data.
   */
  pairingNumber?: string;
}

export type MessageUpdated = WAMessageUpdate & {
  sessionId: string;
  messageStatus:
    | "error"
    | "pending"
    | "server"
    | "delivered"
    | "read"
    | "played";
};

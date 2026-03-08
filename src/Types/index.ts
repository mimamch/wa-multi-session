import { WAMessage, WAMessageUpdate, proto } from "baileys";
import { LegacyStore } from "../Store/Store";

export interface SendMessageTypes {
  to: string | number;
  text?: string;
  sessionId: string;
  isGroup?: boolean;
  answering?: WAMessage;
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

export interface SendPollTypes extends SendMessageTypes {
  poll: {
    name: string;
    values: string[];
    selectableCount?: number;
  };
}

export interface MessageReceived extends WAMessage {
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
   * @param path save audio location path with extension
   * @example "./myaudio.mp3"
   */
  saveAudio: (path: string) => Promise<void>;
  /**
   * @param path save image location path without extension
   * @example "./mydocument"
   */
  saveDocument: (path: string) => Promise<void>;
}

export interface StartSessionParams {
  /**
   * Print QR Code into Terminal
   */
  printQR?: boolean;

  // session events
  onQRUpdated?: (qr: string) => void;
  onConnected?: () => void;
  onConnecting?: () => void;
  onDisconnected?: () => void;

  // message events
  onMessageReceived?: (message: MessageReceived) => void;
  onMessageUpdated?: (message: MessageUpdated) => void;

  // store
  store?: LegacyStore;
}

export interface StartSessionWithPairingCodeParams {
  /**
   * Phone Number with Country Code
   */
  phoneNumber: string;

  // session events
  onQRUpdated?: (qr: string) => void;
  onConnected?: () => void;
  onConnecting?: () => void;
  onDisconnected?: () => void;
  onPairingCode?: (code: string) => void;

  // message events
  onMessageReceived?: (message: MessageReceived) => void;
  onMessageUpdated?: (message: MessageUpdated) => void;

  // store
  store?: LegacyStore;
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

/**
 * Options for starting a WhatsApp session via pairing code instead of QR scan.
 * Use this when the device cannot display a QR code (e.g., headless servers).
 */
export interface StartSessionWithPairingCodeOptions {
  /** The phone number linked to the WhatsApp account, in international format without '+' (e.g. "628123456789"). */
  phoneNumber: string;
  /** Called with the 8-character pairing code once it is retrieved from WhatsApp. Display this to the user so they can enter it in the WhatsApp app. */
  onPairingCode?: (code: string) => void;
  /** Called when the session successfully connects to WhatsApp. */
  onConnected?: () => void;
  /** Called when the session begins the connection handshake. */
  onConnecting?: () => void;
  /** Called when the session is permanently disconnected (logged out or max retries exceeded). */
  onDisconnected?: () => void;
  /** Called for each incoming message in this session. */
  onMessageReceived?: (message: MessageReceived) => void;
  /** Called when a sent message's delivery/read status changes. */
  onMessageUpdated?: (message: MessageUpdated) => void;
}

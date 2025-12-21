import { LevelWithSilentOrString } from "pino";
import { MessageReceived, MessageUpdated } from ".";
import { Adapter } from "../Adapter";

export type WhatsappConstructorProps = {
  adapter: Adapter;
  autoLoad?: boolean;
  debugLevel?: LevelWithSilentOrString;

  /**
   * event callbacks
   */
  onConnecting?: (sessionId: string) => any;
  onConnected?: (sessionId: string) => any;
  onDisconnected?: (sessionId: string) => any;
  onPairingCode?: (sessionId: string, code: string) => void;
  onMessageUpdated?: (data: MessageUpdated) => any;
  onMessageReceived?: (msg: MessageReceived) => any;
  onQRUpdated?: (qr: string) => any;
};

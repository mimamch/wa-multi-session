import { AuthenticationState, WASocket } from "baileys";

export type Store = {
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
  clearCreds: () => Promise<void>;
};

export type Session = {
  sock: WASocket;
  store: Store;
  status: "connecting" | "connected" | "disconnected";
};

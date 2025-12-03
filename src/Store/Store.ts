import { AuthenticationState } from "baileys";

export abstract class LegacyStore {
  abstract state: AuthenticationState;
  abstract saveCreds(): Promise<void>;
  abstract deleteCreds(): Promise<void>;
}

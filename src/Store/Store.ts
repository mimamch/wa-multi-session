import { AuthenticationState } from "baileys";

export abstract class Store {
  abstract state: AuthenticationState;
  abstract saveCreds(): Promise<void>;
  abstract deleteCreds(): Promise<void>;
}

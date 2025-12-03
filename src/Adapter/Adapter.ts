export abstract class Adapter {
  abstract writeData(
    sessionId: string,
    key: string,
    category: string,
    data: string
  ): Promise<void>;

  /**
   * Read specific data related to a session ID.
   */
  abstract readData(sessionId: string, key: string): Promise<string | null>;

  /**
   * Delete specific data related to a session ID.
   */
  abstract deleteData(sessionId: string, key: string): Promise<void>;

  /**
   * Clear all data related to a session ID. Triggered when a session is deleted or logout.
   */
  abstract clearData(sessionId: string): Promise<void>;

  /**
   * List all existing session IDs, will be used when loading existing sessions.
   * if not implemented, loading existing sessions will be skipped
   */
  abstract listSessions?(): Promise<string[]>;
}

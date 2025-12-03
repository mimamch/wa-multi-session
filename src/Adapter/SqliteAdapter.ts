import { Database, open } from "sqlite";
import { Adapter } from "./Adapter";
import sqlite3 from "sqlite3";
import fs from "fs/promises";
import path from "path";

type SQLiteAdapterConstuctorProps = {
  databasePath?: string;
};

export class SQLiteAdapter implements Adapter {
  private database: Database<sqlite3.Database, sqlite3.Statement> | null = null;
  private databasePath: string;

  constructor(props?: SQLiteAdapterConstuctorProps) {
    this.databasePath = props?.databasePath || "./wa_credentials/database.db";
  }

  private async init() {
    if (!this.database) {
      // make directory if not exists
      await fs.mkdir(path.dirname(path.resolve(this.databasePath)), {
        recursive: true,
      });

      this.database = await open({
        filename: `${path.resolve(this.databasePath)}`,
        driver: sqlite3.Database,
      });

      await this.database.exec("PRAGMA journal_mode = WAL;");
      await this.database.exec("PRAGMA busy_timeout = 5000;");
      this.database.configure("busyTimeout", 5000);

      // Create table if not exists
      await this.database.exec(`
            CREATE TABLE IF NOT EXISTS auth_store (
            id TEXT,
            session_id TEXT,
            category TEXT,
            value TEXT,
            PRIMARY KEY (id, session_id)
            )
        `);
    }
  }

  async readData(sessionId: string, key: string): Promise<string | null> {
    await this.init();

    const row = await this.database.get(
      `SELECT value FROM auth_store WHERE id = ? AND session_id = ?`,
      key,
      sessionId
    );
    return row ? row.value : null;
  }

  async writeData(
    sessionId: string,
    key: string,
    category: string,
    data: string
  ): Promise<void> {
    await this.init();
    await this.database.run(
      `
      INSERT OR REPLACE INTO auth_store (id, session_id, category, value)
      VALUES (?, ?, ?, ?)
      `,
      key,
      sessionId,
      category,
      data
    );
  }

  async deleteData(sessionId: string, key: string): Promise<void> {
    await this.init();
    await this.database.run(
      `DELETE FROM auth_store WHERE id = ? AND session_id = ?`,
      key,
      sessionId
    );
  }
  async clearData(sessionId: string): Promise<void> {
    await this.init();
    await this.database.run(
      `DELETE FROM auth_store WHERE session_id = ?`,
      sessionId
    );
  }

  async listSessions(): Promise<string[]> {
    await this.init();
    const sessions = await this.database.all(
      "SELECT DISTINCT session_id FROM auth_store"
    );
    return (
      sessions as {
        session_id: string;
      }[]
    ).map((row) => row.session_id);
  }
}

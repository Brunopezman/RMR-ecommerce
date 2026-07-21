/**
 * Type declarations for sql.js (pure JS SQLite, no native bindings).
 * The package does not ship its own .d.ts files.
 */

declare module 'sql.js' {
  interface SqlJsStatic {
    Database: DatabaseConstructor;
  }

  interface DatabaseConstructor {
    new(data?: ArrayLike<number> | Buffer | null): Database;
    (data?: ArrayLike<number> | Buffer | null): Database;
  }

  interface QueryExecResult {
    columns: string[];
    values: unknown[][];
  }

  interface Database {
    run(sql: string, params?: unknown[]): Database;
    exec(sql: string): QueryExecResult[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
  }

  interface Statement {
    bind(params?: unknown[]): boolean;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): boolean;
  }

  export default function initSqlJs(config?: Record<string, unknown>): Promise<SqlJsStatic>;
}

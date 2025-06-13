import { PgConnection } from '../persistence/pg-connection.js';

const INITIAL_CONTEXT = {
  db: 'pg',
  data_imported: false,
};

export class AppContext {
  static #context = INITIAL_CONTEXT;

  static async set(key, value) {
    await PgConnection.query(`UPDATE config SET "${key}" = $1`, [value]);
    this.#context[key] = value;
  }

  static get(key) {
    return this.#context[key];
  }

  static getContext() {
    return this.#context;
  }

  static async init() {
    const { db, data_imported } = await PgConnection.query(
      'SELECT db, data_imported FROM config',
    ).then((r) => r[0]);
    this.#context.db = db;
    this.#context.data_imported = data_imported;
  }
}

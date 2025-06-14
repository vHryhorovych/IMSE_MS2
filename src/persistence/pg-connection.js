import { Pool } from 'pg';

export class PgConnection {
  static client;

  static async init() {
    const host = process.env.PG_DB_HOST ?? 'localhost';
    const port = process.env.PG_DB_PORT ?? 5433;
    const user = process.env.PG_DB_USER ?? 'postgres';
    const password = process.env.PG_DB_PASSWORD ?? 'password';
    const database = process.env.PG_DB_NAME ?? 'imse_db';
    this.client = new Pool({
      host,
      user,
      password,
      database,
      port,
    });
    await this.client.query('SELECT NOW()');
    console.log('PostgreSQL connection established');
  }

  static async teardown() {
    return this.client.end();
  }

  static query(sql, params = []) {
    return this.client.query(sql, params).then((res) => res.rows);
  }
}

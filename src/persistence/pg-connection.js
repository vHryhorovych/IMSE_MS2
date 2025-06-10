import { Pool } from 'pg';

const {
  POSTGRES_HOST: HOST,
  POSTGRES_HOST_FILE: HOST_FILE,
  POSTGRES_USER: USER,
  POSTGRES_USER_FILE: USER_FILE,
  POSTGRES_PASSWORD: PASSWORD,
  POSTGRES_PASSWORD_FILE: PASSWORD_FILE,
  POSTGRES_DB: DB,
  POSTGRES_DB_FILE: DB_FILE,
} = process.env;

export class PgConnection {
  static client;

  static async init() {
    const host = 'localhost';
    const user = 'postgres';
    const password = 'password';
    const database = 'imse_db';
    this.client = new Pool({
      host,
      user,
      password,
      database,
      port: 5433,
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

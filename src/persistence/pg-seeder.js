import { smapleNTimes } from './randomiser.js';

export class PgSeeder {
  constructor(client) {
    this.client = client;
  }

  async seed(data) {
    const tables = Object.keys(data);
    await this.client.query(
      `TRUNCATE ${tables.join(', ')} RESTART IDENTITY CASCADE`,
    );
    for (const table of tables) {
      const columns = data[table][0].join(', ');
      const rows = smapleNTimes(data[table].slice(1), 3);
      const values = rows.map((row) => `(${row.join(', ')})`).join(', ');
      const query = `INSERT INTO ${table} (${columns}) VALUES ${values}`;
      await this.client.query(query);
    }
  }
}

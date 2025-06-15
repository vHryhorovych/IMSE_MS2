import { smapleNTimes } from './randomiser.js';
import seedData from './seed-data.json' with { type: 'json' };

const N = 6;

export class PgSeeder {
  constructor(client) {
    this.client = client;
  }

  async seed(data = seedData) {
    const tables = Object.keys(data);
    await this.client.query(
      `TRUNCATE ${tables.join(', ')} RESTART IDENTITY CASCADE`,
    );
    for (const table of tables) {
      if (table === 'employee') {
        await this.seedEmployees(data);
        continue;
      }
      const columns = data[table][0];
      const samples = smapleNTimes(data[table].slice(1), N);
      const rows = this.normaliseIds(columns, samples);
      const values = rows.map((row) => `(${row.join(', ')})`).join(', ');
      const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values}`;
      await this.client.query(query);
    }
  }

  async seedEmployees(data) {
    const columns = data['employee'][0];
    const samples = smapleNTimes(data['employee'].slice(1), N);
    const rows = this.normaliseIds(columns, samples);

    for (const row of rows) {
      const id = await this.client
        .query(
          `INSERT INTO employee ("first_name", "last_name", "store_id", "email") VALUES (${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}) RETURNING id`,
        )
        .then((res) => res[0].id);
      if (row.at(-1)) {
        await this.client.query(
          `INSERT INTO technician (employee_id, specialization, certificate) VALUES (${id}, ${row.at(
            -2,
          )}, ${row.at(-1)})`,
        );
      } else {
        await this.client.query(
          `INSERT INTO salesperson (employee_id, commission_rate, revenue) VALUES (${id}, ${row.at(
            -4,
          )}, ${row.at(-3)})`,
        );
      }
    }
  }

  normaliseIds(columns, rows) {
    const idxs = columns
      .map((c, idx) => (c.includes('id') ? idx : null))
      .filter((e) => e !== null);
    return rows.map((r) => {
      for (const idx of idxs) {
        r[idx] = (r[idx] % N) + 1;
      }
      return r;
    });
  }
}

import { smapleNTimes } from './randomiser.js';
import seedData from './seed-data.json' with { type: 'json' };

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
      const columns = data[table][0].join(', ');
      const rows = smapleNTimes(data[table].slice(1), 3);
      const values = rows.map((row) => `(${row.join(', ')})`).join(', ');
      const query = `INSERT INTO ${table} (${columns}) VALUES ${values}`;
      await this.client.query(query);
    }
  }

  async seedEmployees(data) {
    const rows = smapleNTimes(data['employee'].slice(1), 3);
    for (const row of rows) {
      const id = await this.client
        .query(
          `INSERT INTO employee ("first_name", "last_name", "store_id") VALUES (${row[0]}, ${row[1]}, ${row[2]}) RETURNING id`,
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
}

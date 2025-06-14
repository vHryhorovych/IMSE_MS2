import { MongoClient } from 'mongodb';

const host = process.env.MONGO_DB_HOST ?? 'localhost';
const port = process.env.MONGO_DB_PORT ?? 27018;
const user = process.env.MONGO_DB_USER ?? 'root';
const password = process.env.MONGO_DB_PASSWORD ?? 'example';
const db = 'imse';

export class MongoConnection {
  static connection;
  static db;

  static async init() {
    this.connection = await MongoClient.connect(
      `mongodb://${user}:${password}@${host}:${port}`,
    );
    this.db = await this.connection.db(db);
    await this.db.command({ ping: 1 });
    console.log('MongoDB connection established');
  }

  static async teardown() {
    await this.connection.close();
  }
}

import { MongoClient } from 'mongodb';

const user = 'root';
const password = 'example';
const host = 'localhost';
const port = 27018;
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

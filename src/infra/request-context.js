import { AsyncLocalStorage } from 'async_hooks';
import { AppContext } from './app-context.js';
import { PgConnection } from '../persistence/pg-connection.js';
import { MongoConnection } from '../persistence/mongo-connection.js';
import { PgRepository } from '../persistence/pg-repository.js';
import { MongoRepository } from '../persistence/mongo-repository.js';
import { DomainService } from '../domain/service.js';
import { MongoSeeder } from '../persistence/mongo-seeder.js';
import { PgSeeder } from '../persistence/pg-seeder.js';

export class RequestContext {
  static #ctx = new AsyncLocalStorage();

  static init(req, res, next) {
    const db = AppContext.get('db');
    const repo =
      db === 'pg'
        ? new PgRepository(PgConnection)
        : new MongoRepository(MongoConnection);
    const mongoSeeder = new MongoSeeder(MongoConnection);
    const pgSeeder = new PgSeeder(PgConnection);
    const domainService = new DomainService(repo, mongoSeeder, pgSeeder);
    return this.#ctx.run({ domainService }, async () => {
      await next();
    });
  }

  static get(key) {
    return this.#ctx.getStore()[key];
  }
}

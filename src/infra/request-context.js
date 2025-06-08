import { AsyncLocalStorage } from 'async_hooks';
import { AppContext } from './app-context.js';
import { PgConnection } from '../persistence/pg-connection.js';
import { MongoConnection } from '../persistence/mongo-connection.js';
import { PgRepository } from '../persistence/pg-repository.js';
import { MongoRepository } from '../persistence/mongo-repository.js';
import { DomainService } from '../domain/service.js';
import { MongoSeeder } from '../persistence/mongo-seeder.js';
import { PgSeeder } from '../persistence/pg-seeder.js';
import { AnalyticsService } from '../domain/analytics-service.js';

export class RequestContext {
  static #ctx = new AsyncLocalStorage();

  static init(req, res, next) {
    // Improvised DI composition root, sufficient for our use-cases. Should use a proper DI framework in production.
    const db = AppContext.get('db');
    const repo =
      db === 'pg'
        ? new PgRepository(PgConnection)
        : new MongoRepository(MongoConnection);
    const mongoSeeder = new MongoSeeder(MongoConnection);
    const pgSeeder = new PgSeeder(PgConnection);
    const analyticsService = new AnalyticsService(repo);
    const domainService = new DomainService(repo, mongoSeeder, pgSeeder);
    return this.#ctx.run({ domainService, analyticsService }, async () => {
      await next();
    });
  }

  static get(key) {
    return this.#ctx.getStore()[key];
  }
}

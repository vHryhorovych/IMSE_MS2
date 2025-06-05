import { AppContext } from '../infra/app-context.js';

export class DomainService {
  constructor(repository, mongoSeeder, pgSeeder) {
    this.pgSeeder = pgSeeder;
    this.repository = repository;
    this.mongoSeeder = mongoSeeder;
  }

  switchToMongo() {
    AppContext.set('db', 'mongo');
    this.mongoSeeder.seed();
    return { success: true };
  }

  importData() {
    this.pgSeeder.seed();
    return { success: true };
  }

  test() {
    return { success: true, mesage: 'Test use case.' };
  }
}

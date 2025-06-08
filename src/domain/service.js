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

  createemployee({
    id,
    first_name,
    second_name,
    store_id,
    supervisor_id = null,
    commission_rate = 0.05,
    revenue = 0,
    role,
  }) {
    return this.repository.createEmployee({
      id,
      firstName: first_name,
      secondName: second_name,
      store: { id: store_id },
      supervisor: supervisor_id ? { id: supervisor_id } : null,
      commission_rate,
      revenue,
      role,
    });
  }
}

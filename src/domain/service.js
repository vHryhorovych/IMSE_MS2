import { AppContext } from '../infra/app-context.js';

const datesIntersect = (range1, range2) => {
  return (
    (range1.startDate < range2.startDate &&
      range1.endDate > range2.startDate) ||
    (range2.startDate < range1.startDate && range2.endDate > range1.startDate)
  );
};

export class DomainService {
  constructor(repository, mongoSeeder, pgSeeder) {
    this.pgSeeder = pgSeeder;
    this.repository = repository;
    this.mongoSeeder = mongoSeeder;
  }

  async switchToMongo() {
    AppContext.set('db', 'mongo');
    await this.mongoSeeder.seed();
    return { success: true };
  }

  async importData() {
    await this.pgSeeder.seed();
    return { success: true };
  }

  test() {
    return { success: true, mesage: 'Test use case.' };
  }

  async createemployee({
    id,
    first_name,
    second_name,
    store_id,
    supervisor_id = null,
    commission_rate = 0.05,
    revenue = 0,
    role,
  }) {
    const employee = await this.repository.createEmployee({
      id,
      firstName: first_name,
      secondName: second_name,
      store: { id: store_id },
      supervisor: supervisor_id ? { id: supervisor_id } : null,
      commission_rate,
      revenue,
      role,
    });
    return { success: true, data: employee };
  }

  async getStores() {
    const stores = await this.repository.getStores();
    return { success: true, data: stores };
  }

  async getBikes({ storeId }) {
    const bikes = await this.repository.getBikes({ storeId });
    return { success: true, data: bikes };
  }

  async rentBike({ bikeId, customerId, startDate, endDate }) {
    const rentals = await this.repository.getRentals({ bikeId });
    const rentalPossible = rentals.some((r) =>
      datesIntersect(
        { startDate, endDate },
        { startDate: r.startDate, endDate: r.endDate },
      ),
    );
    if (!rentalPossible) {
      return {
        success: false,
        message: 'Bike is already rented during the requested period.',
      };
    }
    const retal = await this.repository.saveRental({
      bicycle: { id: bikeId },
      customer: { id: customerId },
      startDate,
      endDate,
    });
    return { success: true, data: retal };
  }
}

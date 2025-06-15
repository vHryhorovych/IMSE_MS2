import { AppContext } from '../infra/app-context.js';

const datesIntersect = (range1, range2) => {
  return (
    (range1.startDate <= range2.startDate &&
      range1.endDate >= range2.startDate) ||
    (range2.startDate <= range1.startDate && range2.endDate >= range1.startDate)
  );
};

export class DomainService {
  constructor(repository, mongoSeeder, pgSeeder) {
    this.pgSeeder = pgSeeder;
    this.repository = repository;
    this.mongoSeeder = mongoSeeder;
  }

  async switchToMongo() {
    const db = AppContext.get('db');
    if (db === 'mongo') {
      return { success: false, message: 'MongoDB is already used.' };
    }
    const stores = await this.repository.getStores();
    const bikes = await this.repository.getBikes();
    const rentals = await this.repository.getRentals();
    const customers = await this.repository.getCustomers();
    const employees = await this.repository.getEmployees();
    await this.mongoSeeder.seed({
      stores,
      bikes,
      rentals,
      customers,
      employees,
    });
    await AppContext.set('db', 'mongo');
    return { success: true };
  }

  async importData() {
    const alreadyImported = AppContext.get('data_imported');
    if (alreadyImported) {
      return { success: false, message: 'Data already imported.' };
    }
    await this.pgSeeder.seed();
    await AppContext.set('data_imported', true);
    return { success: true };
  }

  test() {
    return { success: true, mesage: 'Test use case.' };
  }

  getEmployees() {
    return this.repository.getEmployees().then((employees) => {
      return { success: true, data: employees };
    });
  }

  getCustomers() {
    return this.repository.getCustomers().then((customers) => {
      return { success: true, data: customers };
    });
  }

  async createEmployee({ firstName, lastName, email, storeId, role, extras }) {
    const employee = await this.repository.createEmployee({
      firstName,
      lastName,
      store: { id: storeId },
      role,
      email,
      ...extras,
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

  async checkBikeAvailability({ bikeId, startDate, endDate }) {
    const rentals = await this.repository.getRentals({ bikeId });
    const rentalPossible = !rentals.some((r) =>
      datesIntersect(
        { startDate, endDate },
        { startDate: r.startDate, endDate: r.endDate },
      ),
    );
    return {
      success: true,
      data: { available: rentalPossible },
    };
  }

  async rentBike({ bikeId, customerId, startDate, endDate }) {
    const rentals = await this.repository.getRentals({ bikeId });
    const rentalPossible = !rentals.some((r) =>
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

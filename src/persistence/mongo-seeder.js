const omitKeys = (keys) => (obj) => {
  const rest = { ...obj };
  for (const key of keys) {
    delete rest[key];
  }
  return rest;
};

export class MongoSeeder {
  constructor(client) {
    this.client = client;
  }

  async seed(data) {
    const { bikes, rentals, customers, employees, stores } = data;

    const { insertedIds: mongoCustomerIds } = await this.client.db
      .collection('customers')
      .insertMany(customers.map(omitKeys(['id'])));

    const { insertedIds: mongoStoreIds } = await this.client.db
      .collection('stores')
      .insertMany(stores.map(omitKeys(['id'])));

    const employeesToInsert = employees.map((emp) => {
      const storeIdx = stores.findIndex((s) => s.id === emp.store.id);

      return {
        ...omitKeys(['id'])(emp),
        store: { _id: mongoStoreIds[storeIdx] },
      };
    });
    const { insertedIds: mongoEmployeeIds } = await this.client.db
      .collection('employees')
      .insertMany(employeesToInsert);

    const bikesToInsert = bikes.map((bike) => {
      const storeIdx = stores.findIndex((s) => s.id === bike.store.id);
      return {
        ...omitKeys(['id'])(bike),
        store: { _id: mongoStoreIds[storeIdx] },
      };
    });
    const { insertedIds: mongoBikeIds } = await this.client.db
      .collection('bikes')
      .insertMany(bikesToInsert);

    const rentalsToInsert = rentals.map((rental) => {
      const customerIdx = customers.findIndex(
        (c) => c.id === rental.customer.id,
      );
      const bikeIdx = bikes.findIndex((b) => b.id === rental.bicycle.id);
      const customer = {
        ...omitKeys(['id'])(customers[customerIdx]),
        _id: mongoCustomerIds[customerIdx],
      };
      const bicycle = {
        ...omitKeys(['id', 'store'])(bikes[bikeIdx]),
        _id: mongoBikeIds[bikeIdx],
      };
      return {
        ...omitKeys(['id'])(rental),
        customer,
        bicycle: bicycle,
      };
    });
    await this.client.db.collection('rentals').insertMany(rentalsToInsert);
  }
}

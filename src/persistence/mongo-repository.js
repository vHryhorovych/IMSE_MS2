export class MongoRepository {
  constructor(client) {
    this.client = client;
  }

  async saveStore(store) {
    await this.client
      .db('bicycle_rental')
      .collection('stores')
      .insertOne(store);
  }

  async saveEmployee(employee) {
    const result = await this.client
      .db('bicycle_rental')
      .collection('employees')
      .insertOne(employee);
    employee.id = result.insertedId;
    return employee;
  }

  async saveBicycle(bicycle) {
    const result = await this.client
      .db('bicycle_rental')
      .collection('bicycles')
      .insertOne(bicycle);
    bicycle.id = result.insertedId;
    return bicycle;
  }

  async saveCustomer(customer) {
    const result = await this.client
      .db('bicycle_rental')
      .collection('customers')
      .insertOne(customer);
    customer.id = result.insertedId;
    return customer;
  }

  async saveRental(rental) {
    const result = await this.client
      .db('bicycle_rental')
      .collection('rentals')
      .insertOne(rental);
    rental.id = result.insertedId;
    return rental;
  }
}

export class PgRepository {
  constructor(client) {
    this.client = client;
  }

  saveStore(store) {
    return this.client.query(
      'INSERT INTO stores (id, address) VALUES ($1, $2)',
      [store.id, store.address],
    );
  }

  async saveEmployee(employee) {
    const employeeId = await this.client
      .query(
        'INSERT INTO employees (id, first_name, last_name, store_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [employee.id, employee.firstName, employee.lastName, employee.store.id],
      )
      .then((res) => res[0].id);
    if (employee.role === 'salesperson') {
      await this.client.query(
        'INSERT INTO saleperson (employee_id, commission_rate, revenue) VALUES ($1, $2, $3)',
        [employee.id, employee.commissionRate, employee.revenue],
      );
    }
    if (employee.role === 'techinician') {
      await this.client.query(
        'INSERT INTO technicians (specialisation, certificate) VALUES ($1, $2)',
        [employee.specialisation, employee.certificate],
      );
    }
    employee.id = employeeId;
    return employee;
  }

  async saveBicylce(bicycle) {
    const bicycleId = await this.client
      .query(
        'INSERT INTO bicycles (id, price, model, store_id) VALUES ($1, $2, $3, $4) RETURNING id',
        [bicycle.id, bicycle.price, bicycle.model, bicycle.store.id],
      )
      .then((res) => res[0].id);
    bicycle.id = bicycleId;
    return bicycle;
  }

  async saveCustomer(customer) {
    const customerId = await this.client
      .query(
        'INSERT INTO customers (id, first_name, last_name, email) VALUES ($1, $2, $3, $4) RETURNING id',
        [customer.id, customer.firstName, customer.lastName, customer.email],
      )
      .then((res) => res[0].id);
    customer.id = customerId;
    return customer;
  }

  async saveRental(rental) {
    const rentalId = await this.client
      .query(
        'INSERT INTO rentals (id, bike_id, customer_id, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [
          rental.id,
          rental.bicycle.id,
          rental.customer.id,
          rental.startDate,
          rental.endDate,
        ],
      )
      .then((res) => res[0].id);
    rental.id = rentalId;
    return rental;
  }
}

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

  async analyticsSembera(filters) {
    const { zipcode_min = '1010', zipcode_max = '1230' } = filters;
    const query = `
      SELECT 
        s.id AS StoreID,
        s.address,

        -- Salesperson metrics
        COUNT(DISTINCT sp.employee_id) AS NumSalespersons,
        SUM(CASE WHEN sp.revenue = 0 THEN 1 ELSE 0 END) AS NewlyHiredSalespersons,
        ROUND(SUM(sp.revenue), 2) AS TotalRevenue,
        ROUND(AVG(NULLIF(sp.revenue, 0)), 2) AS AvgRevenue,

        -- Technician metrics
        COUNT(DISTINCT t.employee_id) AS NumTechnicians,

        -- List of employees at the store
        STRING_AGG(DISTINCT e.first_name || ' ' || e.second_name, ', ' ORDER BY e.second_name) AS Employees
        
      FROM store s
      LEFT JOIN employee e ON s.id = e.store_id
      LEFT JOIN salesperson sp ON e.id = sp.employee_id
      LEFT JOIN technician t ON e.id = t.employee_id
      WHERE s.zip_code BETWEEN $1 AND $2
      GROUP BY s.id, s.address;
    `;
    return await this.client.query(query, [zipcode_min, zipcode_max]);
  }
}

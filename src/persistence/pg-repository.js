export class PgRepository {
  constructor(client) {
    this.client = client;
  }

  getSores() {
    return this.client
      .query('SELECT id, address, zip_code FROM store')
      .then((res) =>
        res.rows.map((s) => ({
          id: s.id,
          address: s.address,
          zipCode: s.zip_code,
        })),
      );
  }

  getBikes({ storeId }) {
    return this.client
      .query('SELECT id, price, model FROM bicycle WHERE store_id = $1', [
        storeId,
      ])
      .then((res) =>
        res.rows.map((b) => ({
          id: b.id,
          price: b.price,
          model: b.model,
          store: { id: storeId },
        })),
      );
  }

  getRentals({ bikeId }) {
    const query = `
      SELECT 
        r.id, 
        r.start_date "startDate", 
        r.end_date "endDate",
      FROM rental r
      WHERE r.bike_id = $1
    `;
    return this.client.query(query, [bikeId]).then((res) => res.rows);
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
    return await this.client
      .query(query, [zipcode_min, zipcode_max])
      .then((r) => r.rows);
  }

  async atalyticsHryhorovych({ startDate, endDate }) {
    const query = `
      WITH all_months AS (
        SELECT generate_series(
          DATE $1,
          DATE $2,
          INTERVAL '1 month'
        )::DATE AS month_start
      ),
      store_ids AS (SELECT id FROM stores),
      store_months AS (
        SELECT s.id, m.month_start
        FROM store_ids s
        CROSS JOIN all_months m
      )

      SELECT 
        s.id,
        s.address,
        sm.month_start AS "month",
        COALESCE(SUM(rental_price.price), 0) AS "revenue"
      FROM store_months sm
      JOIN stores s ON s.id = sm.storeid
      JOIN bicycles b ON b.storeid = s.storeid 
      LEFT JOIN rentals r ON 
        r.bikeid = b.bikeid AND
        r.rentedoutdate >= sm.month_start AND																													 -- START OF THE MONTH 
        r.rentedoutdate	<= DATE_TRUNC('month', sm.month_start) + INTERVAL '1 MONTH' - INTERVAL '1 DAY' -- END OF THE MONTH 
      LEFT JOIN bicycles rental_price ON rental_price.bikeid = r.bikeid
      GROUP BY s.storeid, sm.month_start
      ORDER BY s.storeid, sm.month_start
    `;
    return await this.client
      .query(query, [startDate, endDate])
      .then((r) => r.rows);
  }
}

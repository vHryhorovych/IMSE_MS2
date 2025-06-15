export class PgRepository {
  constructor(client) {
    this.client = client;
  }

  getStores() {
    return this.client.query(
      'SELECT id, address, zip_code AS "zipCode" FROM store',
    );
  }

  getBikes({ storeId } = {}) {
    return this.client
      .query(
        'SELECT id, price, model, store_id FROM bicycle WHERE ($1::integer IS NULL OR store_id = $1)',
        [storeId ?? null],
      )
      .then((res) =>
        res.map((b) => ({
          id: b.id,
          price: b.price,
          model: b.model,
          store: { id: b.store_id },
        })),
      );
  }

  getEmployees() {
    const query = `
      SELECT 
        e.id, 
        e.first_name "firstName", 
        e.last_name "lastName", 
        jsonb_build_object('id', e.store_id) AS "store", 
        jsonb_build_object('id', e.supervisor_id) AS "supervisor", 
        sp.commission_rate "commissionRate", 
        sp.revenue, 
        t.specialization, 
        t.certificate, 
        CASE
          WHEN sp.employee_id IS NOT NULL THEN 'salesperson'
          WHEN t.employee_id IS NOT NULL THEN 'technician'
        END AS role
      FROM employee e
      LEFT JOIN salesperson sp ON e.id = sp.employee_id
      LEFT JOIN technician t ON e.id = t.employee_id
    `;
    return this.client.query(query);
  }

  getCustomers() {
    const query = `
      SELECT 
        id, 
        first_name "firstName", 
        last_name "lastName", 
        email 
      FROM customer
    `;
    return this.client.query(query);
  }

  getRentals({ bikeId } = {}) {
    const query = `
      SELECT 
        r.id, 
        r.start_date "startDate", 
        r.end_date "endDate",
        jsonb_build_object('id', r.bicycle_id) AS "bicycle",
        jsonb_build_object('id', r.customer_id) AS "customer"
      FROM rental r
      WHERE $1::integer IS NULL OR r.bicycle_id = $1
    `;
    return this.client.query(query, [bikeId ?? null]);
  }

  saveStore(store) {
    return this.client.query(
      'INSERT INTO stores (id, address) VALUES ($1, $2)',
      [store.id, store.address],
    );
  }

  async createEmployee(employee) {
    const employeeId = await this.client
      .query(
        'INSERT INTO employee (first_name, last_name, store_id, email) VALUES ($1, $2, $3, $4) RETURNING id',
        [
          employee.firstName,
          employee.lastName,
          employee.store.id,
          employee.email,
        ],
      )
      .then((res) => res[0].id);

    if (employee.role === 'salesperson') {
      await this.client.query(
        'INSERT INTO salesperson (employee_id, commission_rate, revenue) VALUES ($1, $2, $3)',
        [employeeId, employee.commissionRate, employee.revenue ?? 0],
      );
    }
    if (employee.role === 'technician') {
      await this.client.query(
        'INSERT INTO technician (employee_id, specialization, certificate) VALUES ($1, $2, $3)',
        [employeeId, employee.specialisation, employee.certificate],
      );
    }
    return { id: employeeId };
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
        'INSERT INTO rental (bicycle_id, customer_id, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING id',
        [
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
    const { zipcodeMin = '1010', zipcodeMax = '1230' } = filters;
    const query = `
      SELECT 
        s.id AS "storeId",
        s.address,

        -- Salesperson metrics
        COUNT(DISTINCT sp.employee_id) AS "salesPersonsN",
        SUM(CASE WHEN sp.revenue = 0 THEN 1 ELSE 0 END) AS "newlyHiredSalespersonsN",
        ROUND(SUM(sp.revenue), 2) AS "totalRevenue",
        ROUND(AVG(NULLIF(sp.revenue, 0)), 2) AS "avgRevenue",

        -- Technician metrics
        COUNT(DISTINCT t.employee_id) AS "techniciansN",
        
        -- List of employees at the store
        (
          SELECT ARRAY_AGG(name ORDER BY name)
          FROM (
            SELECT DISTINCT e2.first_name || ' ' || e2.last_name AS name
            FROM employee e2
            WHERE e2.store_id = s.id
          ) sub
        ) AS employees
        
        
      FROM store AS s
      LEFT JOIN employee e ON s.id = e.store_id
      LEFT JOIN salesperson sp ON e.id = sp.employee_id
      LEFT JOIN technician t ON e.id = t.employee_id
      WHERE s.zip_code::integer BETWEEN $1::integer AND $2::integer
      GROUP BY s.id, s.address
    `;
    return await this.client.query(query, [zipcodeMin, zipcodeMax]);
  }

  async analyticsHryhorovych({ startDate, endDate }) {
    const query = `
      WITH all_months AS (
        SELECT generate_series(
          $1::DATE,
          $2::DATE,
          '1 month'::INTERVAL
        )::DATE AS month_start
      ),
      store_ids AS (SELECT id FROM store),
      store_months AS (
        SELECT s.id, m.month_start
        FROM store_ids s
        CROSS JOIN all_months m
      )

      SELECT 
        s.id,
        s.address,
        sm.month_start AS "month",
        COALESCE(SUM(rental_price.price), 0)::INTEGER AS "revenue"
      FROM store_months sm
      JOIN store s ON s.id = sm.id
      JOIN bicycle b ON b.store_id = s.id
      LEFT JOIN rental r ON 
        r.bicycle_id = b.id AND
        r.start_date >= sm.month_start AND																													 -- START OF THE MONTH 
        r.start_date <= DATE_TRUNC('month', sm.month_start) + INTERVAL '1 MONTH' - INTERVAL '1 DAY'  -- END OF THE MONTH 
      LEFT JOIN bicycle rental_price ON rental_price.id = r.bicycle_id 
      GROUP BY s.id, sm.month_start
      ORDER BY s.id, sm.month_start
    `;
    return await this.client.query(query, [startDate, endDate]);
  }
}

import { ObjectId } from 'mongodb';

export class MongoRepository {
  constructor(client) {
    this.client = client;
  }

  async getCustomers() {
    return this.client.db
      .collection('customers')
      .find(
        {},
        {
          projection: {
            id: '$_id',
            _id: 0,
            firstName: 1,
            lastName: 1,
          },
        },
      )
      .toArray();
  }

  async getEmployees() {
    return this.client.db
      .collection('employees')
      .find(
        {},
        {
          projection: {
            id: '$_id',
            _id: 0,
            firstName: 1,
            lastName: 1,
          },
        },
      )
      .toArray();
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
    rental.customer._id = rental.customer.id;
    rental.bicycle._id = rental.bicycle.id;
    delete rental.customer.id;
    delete rental.bicycle.id;
    const result = await this.client.db.collection('rentals').insertOne(rental);
    rental.id = result.insertedId;
    return rental;
  }

  getRentals({ bikeId } = {}) {
    return this.client.db
      .collection('rentals')
      .find(
        { 'bicycle._id': bikeId ? new ObjectId(bikeId) : null },
        {
          projection: {
            id: '$_id',
            _id: 0,
            customer: 1,
            bicycle: 1,
            startDate: 1,
            endDate: 1,
            bycicle: 1,
            customer: 1,
          },
        },
      )
      .toArray();
  }

  getStores() {
    return this.client.db
      .collection('stores')
      .find(
        {},
        {
          projection: {
            id: '$_id',
            _id: 0,
            address: 1,
            zipCode: 1,
          },
        },
      )
      .toArray();
  }

  getBikes({ storeId } = {}) {
    return this.client.db
      .collection('bikes')
      .find(
        { 'store._id': new ObjectId(storeId) ?? null },
        {
          projection: {
            id: '$_id',
            _id: 0,
            model: 1,
            price: 1,
            store: 1,
          },
        },
      )
      .toArray();
  }

  async saveEmployee(employee) {
    return this.client.db.collection('employees').insertOne(employee);
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

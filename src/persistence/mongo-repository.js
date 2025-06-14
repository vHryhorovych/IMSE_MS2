import { ObjectId } from 'mongodb';

const getMonthsInRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = [];

  let current = new Date(start);

  while (current <= end) {
    months.push(new Date(current));
    // Move to the next month
    current.setMonth(current.getMonth() + 1);
  }
  return months;
};

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

  async analyticsHryhorovych({ startDate, endDate }) {
    const months = getMonthsInRange(startDate, endDate);

    const pipeline = [
      // === Stage 1: Create all (store, month) combinations ===
      // This replicates the `store_months` CTE (CROSS JOIN)
      {
        $addFields: {
          // Pass the generated months array into the pipeline for each store
          month: months,
        },
      },
      {
        // Create a separate document for each store/month pair
        $unwind: '$month',
      },
      // === Stage 2: Find and Sum Revenue for each (store, month) pair ===
      // This replicates the LEFT JOINs and GROUP BY logic
      {
        $lookup: {
          from: 'rentals',
          let: {
            store_id: '$_id',
            start_of_month: '$month',
            // Calculate the start of the next month for the date range comparison
            start_of_next_month: {
              $dateAdd: { startDate: '$month', unit: 'month', amount: 1 },
            },
          },
          pipeline: [
            // Step A: Match rentals within the given month
            {
              $match: {
                $expr: {
                  $and: [
                    { $gte: ['$startDate', '$$start_of_month'] },
                    { $lte: ['$startDate', '$$start_of_next_month'] },
                  ],
                },
              },
            },
            // Step B: Join with bicycles to get price and check the store_id
            {
              $lookup: {
                from: 'bikes',
                localField: 'bicycle._id',
                foreignField: '_id',
                as: 'bicycle',
              },
            },
            { $unwind: '$bicycle' },
            // Step C: Filter for rentals whose bicycle belongs to the correct store
            {
              $match: {
                $expr: { $eq: ['$bicycle.store._id', '$$store_id'] },
              },
            },
            // Step D: Project just the price for the final sum
            {
              $project: {
                _id: 0,
                price: { $toDouble: '$bicycle.price' },
                ms: '$$start_of_month',
                me: '$$start_of_next_month',
              },
            },
          ],
          as: 'monthly_rentals',
        },
      },
      // === Stage 3: Format the final output ===
      {
        $project: {
          _id: 0,
          id: '$_id',
          address: '$address',
          month: '$month',
          // Sum the prices from the rentals found. $sum on an empty array is 0,
          // which handles the COALESCE(..., 0) logic.
          revenue: { $sum: '$monthly_rentals.price' },
        },
      },
      // === Stage 4: Order the results ===
      {
        $sort: {
          id: 1,
          month: 1,
        },
      },
    ];

    return await this.client.db
      .collection('stores')
      .aggregate(pipeline)
      .toArray();
  }
}

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

  async getCustomers({ id } = {}) {
    const filters = {};
    if (id) {
      filters._id = new ObjectId(id);
    }
    return this.client.db
      .collection('customers')
      .find(filters, {
        projection: {
          id: '$_id',
          _id: 0,
          firstName: 1,
          lastName: 1,
          email: 1,
        },
      })
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
            email: 1,
            'store.id': '$store._id',
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
    const customer = await this.getCustomers({ id: rental.customer.id }).then(
      (c) => c[0],
    );
    customer._id = new ObjectId(rental.customer.id);
    delete customer.id;
    rental.customer = customer;
    const bicycle = await this.getBikes({ id: rental.bicycle.id }).then(
      (b) => b[0],
    );
    bicycle._id = new ObjectId(rental.bicycle.id);
    delete bicycle.id;
    rental.bicycle = bicycle;
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

  getBikes({ storeId, id } = {}) {
    const filters = {};
    if (storeId) {
      filters['store._id'] = new ObjectId(storeId);
    }
    if (id) {
      filters._id = new ObjectId(id);
    }
    return this.client.db
      .collection('bikes')
      .find(filters, {
        projection: {
          id: '$_id',
          _id: 0,
          model: 1,
          price: 1,
          store: 1,
        },
      })
      .toArray();
  }

  async createEmployee(employee) {
    employee.store._id = new ObjectId(employee.store.id);
    delete employee.store.id;
    if (employee.role === 'salesperson') {
      delete employee.certificate;
      delete employee.specialisation;
    } else {
      delete employee.revenue;
      delete employee.commissionRate;
    }
    return this.client.db.collection('employees').insertOne(employee);
  }

  async analyticsSembera(filters) {
    const { zipcodeMin = '1010', zipcodeMax = '1230' } = filters;
    const pipeline = [
      { $match: { zipCode: { $gte: zipcodeMin, $lte: zipcodeMax } } },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'store._id',
          as: 'staff',
        },
      },
      {
        $addFields: {
          salespersons: {
            $filter: {
              input: '$staff',
              as: 'sales',
              cond: { $eq: ['$$sales.role', 'salesperson'] },
            },
          },
          technicians: {
            $filter: {
              input: '$staff',
              as: 'tech',
              cond: { $eq: ['$$tech.role', 'technician'] },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          storeId: 1,
          address: 1,
          salesPersonsN: { $size: '$salespersons' },
          newlyHiredSalespersonsN: {
            $size: {
              $filter: {
                input: '$salespersons',
                as: 'sp',
                cond: { $eq: ['$$sp.revenue', 0] },
              },
            },
          },
          totalRevenue: { $sum: '$salespersons.revenue' },
          avgRevenue: { $avg: '$salespersons.revenue' },
          techniciansN: { $size: '$technicians' },
          employees: {
            $map: {
              input: '$staff',
              as: 'e',
              in: { $concat: ['$$e.firstName', ' ', '$$e.lastName'] },
            },
          },
        },
      },

      { $sort: { storeId: 1 } },
    ];
    return await this.client.db
      .collection('stores')
      .aggregate(pipeline)
      .toArray();
  }

  async analyticsHryhorovych({ startDate, endDate }) {
    const months = getMonthsInRange(startDate, endDate);

    const pipeline = [
      {
        $addFields: {
          month: months,
        },
      },
      {
        $unwind: '$month',
      },
      {
        $lookup: {
          from: 'rentals',
          let: {
            store_id: '$_id',
            start_of_month: '$month',
            start_of_next_month: {
              $dateAdd: { startDate: '$month', unit: 'month', amount: 1 },
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $gte: ['$startDate', '$$start_of_month'] },
                    { $lte: ['$startDate', '$$start_of_next_month'] },
                    { $eq: ['$bicycle.store._id', '$$store_id'] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                price: { $toDouble: '$bicycle.price' },
              },
            },
          ],
          as: 'monthly_rentals',
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          address: '$address',
          month: '$month',
          revenue: { $sum: '$monthly_rentals.price' },
        },
      },
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

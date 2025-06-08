class Store {
  constructor(id, address) {
    this.id = id;
    this.address = address;
  }
}

class Bicylce {
  constructor(id, price, model, store) {
    this.id = id;
    this.price = price;
    this.model = model;
    this.store = store;
  }
}

class Customer {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

class Rental {
  constructor(id, bicylce, customer, startDate, endDate) {
    this.id = id;
    this.bicylce = bicylce;
    this.customer = customer;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

class Employee {
  constructor(id, firstName, lastName, store, supervisor = null) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.store = store;
    this.supervisor = supervisor;
  }
}

class Salesperson extends Employee {
  constructor(
    id,
    firstName,
    lastName,
    store,
    commissionRate = 0.05,
    revenue = 0,
    supervisor = null,
  ) {
    super(id, firstName, lastName, store, supervisor);
    this.commissionRate = commissionRate;
    this.revenue = revenue;
  }
}

module.exports = {
  Store,
  Bicylce,
  Customer,
  Rental,
  Salesperson,
};

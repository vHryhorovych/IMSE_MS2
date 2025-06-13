export type Store = {
  id: number | string;
  address: string;
  postalCode: string;
  zipCode: string;
};

export type Bike = {
  id: number | string;
  price: number;
  model: string;
  store: Store | null;
};

export type User = {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'salesperson';
};

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

export type Salesperson = User & {
  role: 'salesperson';
  store: Store;
};

export const isSalesperson = (user: User): user is Salesperson => {
  return user.role === 'salesperson';
};

export type AnalyticsHryhorovychEntry = {
  address: string;
  revenue: number;
  month: Date;
};

export type AnalyticsSemberaEntry = {
  storeId: string | number;
  address: string;
  salesPersonsN: number;
  newlyHiredSalespersonsN: number;
  totalRevenue: number;
  avgRevenue: number;
  techniciansN: number;
  employees: string[];
};

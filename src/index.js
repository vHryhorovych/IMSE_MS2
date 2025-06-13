import express from 'express';
import { PgConnection } from './persistence/pg-connection.js';
import { MongoConnection } from './persistence/mongo-connection.js';
import { RequestContext } from './infra/request-context.js';
import { router } from './routes/router.js';
import { analyticsRouter } from './routes/analytics.js';
import { bikeRouter } from './routes/bike.js';
import { employeeRouter } from './routes/employee.js';
import { storeRouter } from './routes/store.js';
import cors from 'cors';
import { customerRouter } from './routes/customer.js';
import { AppContext } from './infra/app-context.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(import.meta.dirname + '/client/dist/client/browser'));

app.use(RequestContext.init.bind(RequestContext));
app.use(router);
app.use('/analytics', analyticsRouter);
app.use('/bike', bikeRouter);
app.use('/employee', employeeRouter);
app.use('/store', storeRouter);
app.use('/customer', customerRouter);

await Promise.all([PgConnection.init(), MongoConnection.init()]).then(
  async () => {
    await AppContext.init();
    app.listen(3000, () => console.log('Listening on port 3000'));
  },
);

const gracefulShutdown = (error) => {
  console.error('Graceful shutdown initiated:', error);
  Promise.allSettled([
    PgConnection.teardown(),
    MongoConnection.teardown(),
  ]).then(() => process.exit());
};

process.on('uncaughtException', gracefulShutdown);
process.on('unhandledRejection', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown);

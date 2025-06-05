import express from 'express';
import { PgConnection } from './persistence/pg-connection.js';
import { MongoConnection } from './persistence/mongo-connection.js';
import { RequestContext } from './infra/request-context.js';
import { router } from './routes/router.js';

const app = express();

// app.use(express.json());
// app.use(express.static(__dirname + '/static'));

app.use(RequestContext.init.bind(RequestContext));
app.use(router);

// app.get('/items', getItems);
// app.post('/items', addItem);
// app.put('/items/:id', updateItem);
// app.delete('/items/:id', deleteItem);

await Promise.all([PgConnection.init(), MongoConnection.init()]).then(() => {
  app.listen(3000, () => console.log('Listening on port 3000'));
});

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

import { Router } from 'express';
import { RequestContext } from '../infra/request-context.js';
import { AppContext } from '../infra/app-context.js';

export const router = Router();

router.get('/test', (req, res) => {
  const result = RequestContext.get('domainService').test();
  res.json(result);
});

router.post('/import', async (req, res) => {
  const result = await RequestContext.get('domainService').importData();
  res.json(result);
});

router.post('/switch-to-mongo', async (req, res) => {
  const result = await RequestContext.get('domainService').switchToMongo();
  res.json(result);
});

router.get('/ctx', async (req, res) => {
  const ctx = AppContext.getContext();
  res.json({
    success: true,
    data: { db: ctx.db, dataImported: ctx.data_imported },
  });
});

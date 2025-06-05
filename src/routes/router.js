import { Router } from 'express';
import { RequestContext } from '../infra/request-context.js';

export const router = Router();

router.get('/test', (req, res) => {
  const result = RequestContext.get('domainService').test();
  res.json(result);
});

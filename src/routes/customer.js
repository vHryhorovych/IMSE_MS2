import router from 'express';
import { RequestContext } from '../infra/request-context.js';

export const customerRouter = router();

customerRouter.get('/', async (req, res) => {
  try {
    const result = await RequestContext.get('domainService').getCustomers();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

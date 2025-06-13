import router from 'express';
import { RequestContext } from '../infra/request-context.js';

export const employeeRouter = router();

employeeRouter.post('/', async (req, res) => {
  try {
    const result = await RequestContext.get('domainService').createEmployee(
      req.body,
    );
    res.json(result);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

employeeRouter.get('/', async (req, res) => {
  try {
    const result = await RequestContext.get('domainService').getEmployees();
    res.json(result);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

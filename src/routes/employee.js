import router from 'express';

export const employeeRouter = router();

r.post('/', async (req, res) => {
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

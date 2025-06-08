import router from 'express';

export const storeRouter = router();

r.get('/', async (req, res) => {
  try {
    const result = await RequestContext.get('domainService').getStores();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

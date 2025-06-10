import router from 'express';

export const bikeRouter = router();

bikeRouter.get('/', async (req, res) => {
  try {
    const result = await RequestContext.get('domainService').getBikes({
      storeId: req.body.storeId,
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bikeRouter.post('/:id/rent', async (req, res) => {
  try {
    const result = await RequestContext.get('domainService').rentBike({
      bikeId: req.params.id,
      customerId: req.body.customerId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

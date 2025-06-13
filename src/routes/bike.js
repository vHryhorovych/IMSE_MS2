import router from 'express';
import { RequestContext } from '../infra/request-context.js';

export const bikeRouter = router();

bikeRouter.get('/', async (req, res) => {
  try {
    const result = await RequestContext.get('domainService').getBikes({
      storeId: req.query.storeId,
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
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

bikeRouter.get('/:id/check-availability', async (req, res) => {
  try {
    const result = await RequestContext.get(
      'domainService',
    ).checkBikeAvailability({
      bikeId: req.params.id,
      startDate: new Date(req.query.startDate),
      endDate: new Date(req.query.endDate),
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

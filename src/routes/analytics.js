import { Router } from 'express';
import { RequestContext } from '../infra/request-context';

export const analyticsRouter = Router();

analyticsRouter.get('/sembera', async (req, res) => {
  try {
    const { zipcode_min = '1010', zipcode_max = '1230' } = req.query;
    const result = await RequestContext.get(
      'analyticsService',
    ).analyticsSembera({ zipcode_min, zipcode_max });
    res.json(result);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

analyticsRouter.get('/hryhorovych', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await RequestContext.get(
      'analyticsService',
    ).analyticsHryhorovych({ startDate, endDate });
    res.json(result);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

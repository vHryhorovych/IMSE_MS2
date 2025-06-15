import { Router } from 'express';
import { RequestContext } from '../infra/request-context.js';

export const analyticsRouter = Router();

analyticsRouter.get('/sembera', async (req, res) => {
  try {
    const { zipcodeMin, zipcodeMax } = req.query;
    const result = await RequestContext.get(
      'analyticsService',
    ).analyticsSembera({ zipcodeMin, zipcodeMax });
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
    ).analyticsHryhorovych({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

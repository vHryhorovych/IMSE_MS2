import { Router } from 'express';

export const analyticsRouter = Router();

analyticsRouter.get('/', async (req, res) => {
  try {
    const { zipcode_min = '1010', zipcode_max = '1230' } = req.query;

    const query = `
          SELECT 
            s.id AS StoreID,
            s.address,
    
            -- Salesperson metrics
            COUNT(DISTINCT sp.employee_id) AS NumSalespersons,
            SUM(CASE WHEN sp.revenue = 0 THEN 1 ELSE 0 END) AS NewlyHiredSalespersons,
            ROUND(SUM(sp.revenue), 2) AS TotalRevenue,
            ROUND(AVG(NULLIF(sp.revenue, 0)), 2) AS AvgRevenue,
    
            -- Technician metrics
            COUNT(DISTINCT t.employee_id) AS NumTechnicians,
    
            -- List of employees at the store
            STRING_AGG(DISTINCT e.first_name || ' ' || e.second_name, ', ' ORDER BY e.second_name) AS Employees
    
          FROM store s
          LEFT JOIN employee e ON s.id = e.store_id
          LEFT JOIN salesperson sp ON e.id = sp.employee_id
          LEFT JOIN technician t ON e.id = t.employee_id
    
          WHERE s.zip_code BETWEEN $1 AND $2
    
          GROUP BY s.id, s.address;
        `;

    const result = await pool.query(query, [zipcode_min, zipcode_max]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

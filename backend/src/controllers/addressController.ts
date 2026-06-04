import { Request, Response } from 'express';
import { searchCities, searchStreets, lookupZipCode } from '../services/addressValidation/govAddressService';

export async function getCities(req: Request, res: Response): Promise<void> {
  const { q } = req.query;
  if (!q || typeof q !== 'string') { res.status(400).json({ message: 'חסר פרמטר חיפוש' }); return; }

  try {
    const cities = await searchCities(q);
    res.json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', (error as Error).message);
    res.status(502).json({ message: 'שגיאה בחיפוש ערים' });
  }
}

export async function getStreets(req: Request, res: Response): Promise<void> {
  const { city, q } = req.query;
  if (!city || typeof city !== 'string') { res.status(400).json({ message: 'חסר שם עיר' }); return; }
  if (!q || typeof q !== 'string') { res.status(400).json({ message: 'חסר פרמטר חיפוש' }); return; }

  try {
    const streets = await searchStreets(city, q);
    res.json({ streets });
  } catch (error) {
    console.error('Error fetching streets:', (error as Error).message);
    res.status(502).json({ message: 'שגיאה בחיפוש רחובות' });
  }
}

export async function getByZipCode(req: Request, res: Response): Promise<void> {
  const { q } = req.query;
  if (!q || typeof q !== 'string') { res.status(400).json({ message: 'חסר מיקוד' }); return; }

  try {
    const result = await lookupZipCode(q);
    res.json(result ?? null);
  } catch (error) {
    console.error('Error looking up zip code:', (error as Error).message);
    res.status(502).json({ message: 'שגיאה בחיפוש מיקוד' });
  }
}

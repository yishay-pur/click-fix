import { Router } from 'express';
import { getCities, getStreets, getByZipCode } from '../controllers/addressController';

const router = Router();

// GET /api/address/cities?q=query
router.get('/cities', getCities);

// GET /api/address/streets?city=cityName&q=query
router.get('/streets', getStreets);

// GET /api/address/zip?q=1234567
router.get('/zip', getByZipCode);

export default router;

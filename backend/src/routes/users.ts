import { Router } from 'express';
import { getDrivers } from '../controllers/users';
import { auth } from '../middleware/auth';

const router = Router();

// Get all drivers (for sellers to assign)
router.get('/drivers', auth, getDrivers);

export default router;

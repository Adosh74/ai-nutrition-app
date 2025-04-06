import { Router } from 'express';

import { userRouter } from './APIs/user-route';

const router = Router();

router.use('/users', userRouter);

export { router as indexRouter };

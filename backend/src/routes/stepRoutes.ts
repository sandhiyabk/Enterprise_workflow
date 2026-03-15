import { Router } from 'express';
import * as stepController from '../controllers/stepController.js';

const router = Router();

router.post('/', stepController.createStep);
router.get('/workflow/:workflow_id', stepController.listSteps);
router.put('/:id', stepController.updateStep);
router.delete('/:id', stepController.deleteStep);

export default router;

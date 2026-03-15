import { Router } from 'express';
import * as ruleController from '../controllers/ruleController.js';

const router = Router();

router.post('/', ruleController.createRule);
router.get('/step/:step_id', ruleController.listRules);
router.put('/:id', ruleController.updateRule);
router.delete('/:id', ruleController.deleteRule);

export default router;

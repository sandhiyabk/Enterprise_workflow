import { Router } from 'express';
import * as workflowController from '../controllers/workflowController.js';

const router = Router();

router.post('/', workflowController.createWorkflow);
router.get('/', workflowController.listWorkflows);
router.get('/:id', workflowController.getWorkflow);
router.put('/:id', workflowController.updateWorkflow);
router.delete('/:id', workflowController.deleteWorkflow);
router.post('/:id/execute', workflowController.executeWorkflow);
router.post('/:id/webhook', workflowController.handleWebhook);

export default router;

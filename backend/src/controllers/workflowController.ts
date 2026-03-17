import { Request, Response } from 'express';
import { WorkflowService } from '../services/workflowService.js';

const workflowService = new WorkflowService();

export const createWorkflow = async (req: Request, res: Response) => {
  try {
    const { name, input_schema } = req.body;
    const workflow = await workflowService.createWorkflow(name, input_schema);
    res.status(201).json(workflow);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listWorkflows = async (req: Request, res: Response) => {
  try {
    const result = await workflowService.listWorkflows(req.query);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWorkflow = async (req: Request, res: Response) => {
  try {
    const workflow = await workflowService.getWorkflow(req.params.id as string);
    res.json(workflow);
  } catch (error: any) {
    res.status(error.message === 'Workflow not found' ? 404 : 500).json({ error: error.message });
  }
};

export const updateWorkflow = async (req: Request, res: Response) => {
  try {
    const workflow = await workflowService.updateWorkflow(req.params.id as string, req.body);
    res.json(workflow);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    await workflowService.deleteWorkflow(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const executeWorkflow = async (req: Request, res: Response) => {
  try {
    const { input_data, triggered_by } = req.body;
    const execution = await workflowService.executeWorkflow(req.params.id as string, input_data, triggered_by);
    res.json(execution);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const inputData = req.body;
    const execution = await workflowService.executeWorkflow(
      req.params.id as string, 
      inputData, 
      `WEBHOOK_${req.ip}`
    );
    res.status(202).json({
      message: 'Workflow triggered successfully',
      execution_id: execution.id
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

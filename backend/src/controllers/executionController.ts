import { Request, Response } from 'express';
import { ExecutionService } from '../services/executionService.js';

const executionService = new ExecutionService();

export const listExecutions = async (req: Request, res: Response) => {
  try {
    const executions = await executionService.listExecutions();
    res.json(executions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getExecution = async (req: Request, res: Response) => {
  try {
    const execution = await executionService.getExecution(req.params.id as string);
    res.json(execution);
  } catch (error: any) {
    res.status(error.message === 'Execution not found' ? 404 : 500).json({ error: error.message });
  }
};

export const getExecutionLogs = async (req: Request, res: Response) => {
  try {
    const logs = await executionService.getExecutionLogs(req.params.id as string);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const runExecution = async (req: Request, res: Response) => {
  try {
    const { workflowId, inputData, triggeredBy } = req.body;
    const execution = await executionService.runWorkflow(workflowId, inputData, triggeredBy);
    res.status(201).json(execution);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelExecution = async (req: Request, res: Response) => {
  try {
    const execution = await executionService.cancelExecution(req.params.id as string);
    res.json(execution);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const retryExecution = async (req: Request, res: Response) => {
  try {
    await executionService.retryExecution(req.params.id as string);
    res.json({ message: 'Retry initiated' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const approveStep = async (req: Request, res: Response) => {
  try {
    const { approver_id, approved, additional_data } = req.body;
    await executionService.approveStep(req.params.id as string, approver_id, approved, additional_data);
    res.json({ message: 'Approval processed' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

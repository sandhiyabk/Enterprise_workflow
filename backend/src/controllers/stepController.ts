import { Request, Response } from 'express';
import { StepService } from '../services/stepService.js';

const stepService = new StepService();

export const createStep = async (req: Request, res: Response) => {
  try {
    const step = await stepService.createStep(req.body);
    res.status(201).json(step);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listSteps = async (req: Request, res: Response) => {
  try {
    const steps = await stepService.listSteps(req.params.workflow_id as string);
    res.json(steps);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStep = async (req: Request, res: Response) => {
  try {
    const step = await stepService.updateStep(req.params.id as string, req.body);
    res.json(step);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteStep = async (req: Request, res: Response) => {
  try {
    await stepService.deleteStep(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

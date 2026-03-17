import { Request, Response } from 'express';
import { RuleService } from '../services/ruleService.js';

const ruleService = new RuleService();

export const createRule = async (req: Request, res: Response) => {
  try {
    const rule = await ruleService.createRule(req.body);
    res.status(201).json(rule);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listRules = async (req: Request, res: Response) => {
  try {
    const rules = await ruleService.listRules(req.params.step_id as string);
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRule = async (req: Request, res: Response) => {
  try {
    const rule = await ruleService.updateRule(req.params.id as string, req.body);
    res.json(rule);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  try {
    await ruleService.deleteRule(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

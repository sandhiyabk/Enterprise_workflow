import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRule = async (req: Request, res: Response) => {
  try {
    const { step_id, condition, next_step_id, priority } = req.body;
    const rule = await prisma.rule.create({
      data: {
        step_id,
        condition,
        next_step_id: next_step_id || null,
        priority: priority !== undefined ? Number(priority) : 0,
      }
    });
    res.status(201).json(rule);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listRules = async (req: Request, res: Response) => {
  try {
    const { step_id } = req.params as any;
    const rules = await prisma.rule.findMany({
      where: { step_id },
      orderBy: { priority: 'asc' }
    });
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRule = async (req: Request, res: Response) => {
  try {
    const { condition, next_step_id, priority } = req.body;
    
    // Build update object only with provided fields
    const updateData: any = {};
    if (condition !== undefined) updateData.condition = condition;
    if (next_step_id !== undefined) updateData.next_step_id = next_step_id || null;
    if (priority !== undefined) updateData.priority = Number(priority);

    const { id } = req.params as any;
    const rule = await prisma.rule.update({
      where: { id },
      data: updateData
    });
    res.json(rule);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    await prisma.rule.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

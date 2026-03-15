import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createStep = async (req: Request, res: Response) => {
  try {
    const { workflow_id, name, step_type, order, metadata } = req.body;
    const step = await prisma.step.create({
      data: {
        workflow_id,
        name,
        step_type,
        order: order !== undefined ? Number(order) : 0,
        metadata: metadata || {},
      }
    });
    res.status(201).json(step);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const listSteps = async (req: Request, res: Response) => {
  try {
    const { workflow_id } = req.params as any;
    const steps = await prisma.step.findMany({
      where: { workflow_id },
      orderBy: { order: 'asc' },
      include: { rules: true }
    });
    res.json(steps);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateStep = async (req: Request, res: Response) => {
  try {
    const { name, step_type, order, metadata } = req.body;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (step_type !== undefined) updateData.step_type = step_type;
    if (order !== undefined) updateData.order = Number(order);
    if (metadata !== undefined) updateData.metadata = metadata;

    const { id } = req.params as any;
    const step = await prisma.step.update({
      where: { id },
      data: updateData
    });
    res.json(step);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteStep = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    await prisma.step.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

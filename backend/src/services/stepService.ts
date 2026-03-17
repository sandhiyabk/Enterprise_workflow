import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StepService {
  async createStep(data: any) {
    const { workflow_id, name, step_type, order, metadata } = data;
    return prisma.step.create({
      data: {
        workflow_id,
        name,
        step_type,
        order: order !== undefined ? Number(order) : 0,
        metadata: metadata || {},
      }
    });
  }

  async listSteps(workflow_id: string) {
    return prisma.step.findMany({
      where: { workflow_id },
      orderBy: { order: 'asc' },
      include: { rules: true }
    });
  }

  async updateStep(id: string, data: any) {
    const { name, step_type, order, metadata } = data;
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (step_type !== undefined) updateData.step_type = step_type;
    if (order !== undefined) updateData.order = Number(order);
    if (metadata !== undefined) updateData.metadata = metadata;

    return prisma.step.update({
      where: { id },
      data: updateData
    });
  }

  async deleteStep(id: string) {
    return prisma.step.delete({ where: { id } });
  }
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RuleService {
  async createRule(data: any) {
    const { step_id, condition, next_step_id, priority } = data;
    return prisma.rule.create({
      data: {
        step_id,
        condition,
        next_step_id: next_step_id || null,
        priority: priority !== undefined ? Number(priority) : 0,
      }
    });
  }

  async listRules(step_id: string) {
    return prisma.rule.findMany({
      where: { step_id },
      orderBy: { priority: 'asc' }
    });
  }

  async updateRule(id: string, data: any) {
    const { condition, next_step_id, priority } = data;
    const updateData: any = {};
    if (condition !== undefined) updateData.condition = condition;
    if (next_step_id !== undefined) updateData.next_step_id = next_step_id || null;
    if (priority !== undefined) updateData.priority = Number(priority);

    return prisma.rule.update({
      where: { id },
      data: updateData
    });
  }

  async deleteRule(id: string) {
    return prisma.rule.delete({ where: { id } });
  }
}

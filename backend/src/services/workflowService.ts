import { PrismaClient } from '@prisma/client';
import { ExecutionEngine } from '../engines/executionEngine.js';

const prisma = new PrismaClient();
const executionEngine = new ExecutionEngine();

export class WorkflowService {
  async createWorkflow(name: string, inputSchema: any) {
    return prisma.workflow.create({
      data: {
        name,
        input_schema: inputSchema,
      }
    });
  }

  async listWorkflows(query: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search ? {
      name: { contains: String(search), mode: 'insensitive' as any }
    } : {};

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { created_at: 'desc' }
      }),
      prisma.workflow.count({ where })
    ]);

    return {
      workflows,
      pagination: {
        total,
        pages: Math.ceil(total / Number(limit)),
        page: Number(page)
      }
    };
  }

  async getWorkflow(id: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      include: {
        steps: {
          include: { rules: true },
          orderBy: { order: 'asc' }
        }
      }
    });
    if (!workflow) throw new Error('Workflow not found');
    return workflow;
  }

  async updateWorkflow(id: string, data: any) {
    return prisma.workflow.update({
      where: { id },
      data: {
        ...data,
        version: { increment: 1 }
      }
    });
  }

  async deleteWorkflow(id: string) {
    return prisma.workflow.delete({ where: { id } });
  }

  async executeWorkflow(id: string, inputData: any, triggeredBy?: string) {
    return executionEngine.executeWorkflow(id, inputData, triggeredBy);
  }
}

import { PrismaClient } from '@prisma/client';
import { ExecutionEngine } from '../engines/executionEngine.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();
const executionEngine = new ExecutionEngine();

export class ExecutionService {
  async listExecutions() {
    return prisma.execution.findMany({
      include: { workflow: true },
      orderBy: { started_at: 'desc' }
    });
  }

  async getExecution(id: string) {
    const execution = await prisma.execution.findUnique({
      where: { id },
      include: { workflow: true }
    });
    if (!execution) throw new Error('Execution not found');
    return execution;
  }

  async getExecutionLogs(id: string) {
    return prisma.executionLog.findMany({
      where: { execution_id: id },
      orderBy: { started_at: 'asc' }
    });
  }

  async runWorkflow(workflowId: string, inputData: any, triggeredBy?: string) {
    return executionEngine.executeWorkflow(workflowId, inputData, triggeredBy);
  }

  async cancelExecution(id: string) {
    return executionEngine.cancelExecution(id);
  }

  async retryExecution(id: string) {
    return executionEngine.retryExecution(id);
  }

  async approveStep(id: string, approverId: string, approved: boolean, additionalData?: any) {
    return executionEngine.resumeApproval(id, approverId, approved, additionalData);
  }
}

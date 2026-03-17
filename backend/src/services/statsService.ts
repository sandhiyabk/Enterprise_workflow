import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StatsService {
  async getStats() {
    const totalWorkflows = await prisma.workflow.count();
    
    const [successfulExecutions, failedExecutions, inProgressExecutions, pendingExecutions, canceledExecutions] = await Promise.all([
      prisma.execution.count({ where: { status: 'COMPLETED' } }),
      prisma.execution.count({ where: { status: 'FAILED' } }),
      prisma.execution.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.execution.count({ where: { status: 'PENDING' } }),
      prisma.execution.count({ where: { status: 'CANCELED' } }),
    ]);

    const recentCompleted = await prisma.execution.findMany({
      where: { status: 'COMPLETED', ended_at: { not: null } },
      select: { started_at: true, ended_at: true },
      take: 100
    });

    let averageExecutionTimeMs = 0;
    if (recentCompleted.length > 0) {
      const totalDuration = recentCompleted.reduce((sum, exec) => {
        return sum + (exec.ended_at!.getTime() - exec.started_at.getTime());
      }, 0);
      averageExecutionTimeMs = Math.round(totalDuration / recentCompleted.length);
    }

    return {
      totalWorkflows,
      successfulExecutions,
      failedExecutions,
      inProgressExecutions,
      pendingExecutions,
      canceledExecutions,
      averageExecutionTimeMs
    };
  }
}

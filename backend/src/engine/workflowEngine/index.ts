import { PrismaClient } from '@prisma/client';
import { RuleEngine } from '../ruleEngine/index.js';
import { validateInput } from '../../utils/validator.js';

const prisma = new PrismaClient();
const ruleEngine = new RuleEngine();

const MAX_ITERATIONS = 50; // Prevention against infinite loops

export class WorkflowEngine {
  /**
   * Starts a new workflow execution
   */
  public async executeWorkflow(workflowId: string, inputData: any, triggeredBy?: string) {
    // 1. Load Workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { steps: { orderBy: { order: 'asc' } } }
    });

    if (!workflow || !workflow.is_active) {
      throw new Error('Workflow not found or inactive');
    }

    if (!workflow.start_step_id) {
      throw new Error('Workflow has no start step');
    }

    // 2. Validate Input Schema
    const validation = validateInput(workflow.input_schema, inputData);
    if (!validation.valid) {
      throw new Error(`Invalid input data: ${validation.errors.join(', ')}`);
    }

    // 3. Create Execution
    const execution = await prisma.execution.create({
      data: {
        workflow_id: workflow.id,
        workflow_version: workflow.version,
        status: 'IN_PROGRESS' as any,
        data: inputData,
        current_step_id: workflow.start_step_id,
        triggered_by: triggeredBy || 'SYSTEM',
        started_at: new Date(),
      }
    });

    // 4. Process Steps (Async)
    this.processSteps(execution.id);

    return execution;
  }

  /**
   * Background process to move through steps
   */
  private async processSteps(executionId: string) {
    let execution = await prisma.execution.findUnique({
      where: { id: executionId },
      include: { workflow: { include: { steps: true } } }
    });

    if (!execution || (execution.status as string) !== 'IN_PROGRESS') return;

    let currentStepId = execution.current_step_id;
    let iterations = 0;

    while (currentStepId) {
      iterations++;
      
      if (iterations > MAX_ITERATIONS) {
         await prisma.execution.update({
            where: { id: executionId },
            data: { 
                status: 'FAILED' as any, 
                ended_at: new Date() 
            }
         });
         
         await prisma.executionLog.create({
            data: {
                execution_id: executionId,
                step_name: 'System Error',
                step_type: 'SYSTEM',
                evaluated_rules: [],
                status: 'FAILED',
                error_message: 'Maximum workflow iterations reached (possible infinite loop)',
                started_at: new Date(),
                ended_at: new Date()
            }
         });
         return;
      }

      const step = execution.workflow.steps.find((s: any) => s.id === currentStepId);
      if (!step) break;

      const startTime = new Date();
      let nextStepId: string | null = null;
      let status = 'COMPLETED';
      let errorMessage: string | null = null;
      let evaluatedRules: any[] = [];
      let logMetadata: any = {};

      try {
        // Step action based on type
        if (step.step_type === 'APPROVAL') {
          await prisma.executionLog.create({
            data: {
              execution_id: executionId,
              step_name: step.name,
              step_type: step.step_type as any,
              evaluated_rules: [],
              selected_next_step: null,
              status: 'PENDING',
              started_at: startTime,
            }
          });

          await prisma.execution.update({
            where: { id: executionId },
            data: { status: 'PENDING' }
          });
          return;
        }

        if (step.step_type === 'NOTIFICATION') {
          // Simulate sending notification
          const metadata = step.metadata as any;
          logMetadata = {
            notification_channel: metadata?.channel || 'EMAIL',
            recipient: metadata?.assignee_email || 'ADMIN',
            message_template: metadata?.template || 'Step completed'
          };
          console.log(`[NOTIFICATION] Sending ${logMetadata.notification_channel} to ${logMetadata.recipient}`);
        }

        // Evaluate Rules
        const rules = await prisma.rule.findMany({
          where: { step_id: currentStepId as string },
          orderBy: { priority: 'asc' }
        });

        // Default next step if no rules match
        nextStepId = null;

        for (const rule of rules) {
          const isMatch = ruleEngine.evaluate(rule.condition, execution.data as any);
          evaluatedRules.push({
            ruleId: rule.id,
            condition: rule.condition,
            isMatch
          });

          if (isMatch) {
            nextStepId = rule.next_step_id;
            break;
          }
        }

      } catch (error: any) {
        status = 'FAILED';
        errorMessage = error.message;
        
        await prisma.execution.update({
          where: { id: executionId },
          data: { status: 'FAILED' as any, ended_at: new Date() }
        });
        
        await prisma.executionLog.create({
          data: {
            execution_id: executionId,
            step_name: step.name,
            step_type: step.step_type as any,
            evaluated_rules: evaluatedRules,
            selected_next_step: null,
            status,
            error_message: errorMessage,
            started_at: startTime,
            ended_at: new Date()
          }
        });
        return;
      }

      // Log Step
      await prisma.executionLog.create({
        data: {
          execution_id: executionId,
          step_name: step.name,
          step_type: step.step_type as any,
          evaluated_rules: evaluatedRules,
          selected_next_step: nextStepId,
          status,
          started_at: startTime,
          ended_at: new Date()
        }
      });

      // Update State
      currentStepId = nextStepId;
      await prisma.execution.update({
        where: { id: executionId },
        data: {
          current_step_id: nextStepId,
          status: nextStepId ? ('IN_PROGRESS' as any) : ('COMPLETED' as any),
          ended_at: nextStepId ? null : new Date()
        }
      });

      if (!nextStepId) break;

      // Re-fetch execution to get updated data if it was modified by an external process 
      // (though in this loop it's sequential)
    }
  }

  public async resumeApproval(executionId: string, approverId: string, approved: boolean, additionalData?: any) {
    const execution = await prisma.execution.findUnique({
      where: { id: executionId },
      include: { workflow: { include: { steps: true } } }
    });

    if (!execution || (execution.status as string) !== 'PENDING') {
      throw new Error('Execution not found or not in pending state');
    }

    const currentStep = execution.workflow.steps.find((s: any) => s.id === execution.current_step_id);
    if (!currentStep || (currentStep.step_type !== 'APPROVAL' && currentStep.step_type !== 'approval')) {
      throw new Error('Current step is not an approval step');
    }

    const newData = { 
      ...(execution.data as object), 
      approvalResult: approved,
      [`${currentStep.name}_approved`]: approved,
      ...additionalData 
    };

    await prisma.execution.update({
      where: { id: executionId },
      data: { 
        status: 'IN_PROGRESS' as any,
        data: newData
      }
    });

    this.processSteps(executionId);
  }

  public async cancelExecution(executionId: string) {
    return prisma.execution.update({
      where: { id: executionId },
      data: {
        status: 'CANCELED' as any,
        ended_at: new Date()
      }
    });
  }

  public async retryExecution(executionId: string) {
    const execution = await prisma.execution.findUnique({
      where: { id: executionId }
    });

    if (!execution || (execution.status as string) !== 'FAILED') {
      throw new Error('Only failed executions can be retried');
    }

    await prisma.execution.update({
      where: { id: executionId },
      data: {
        status: 'IN_PROGRESS' as any,
        retries: { increment: 1 },
        ended_at: null
      }
    });

    this.processSteps(executionId);
  }
}

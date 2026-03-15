import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Expense Approval Workflow
  const workflow = await prisma.workflow.create({
    data: {
      name: 'Expense Approval',
      input_schema: {
        amount: { type: 'number', required: true },
        country: { type: 'string', required: true },
        department: { type: 'string', required: false },
        priority: { type: 'string', required: true, allowed_values: ['High', 'Medium', 'Low'] }
      }
    }
  });

  // 2. Create Steps
  const managerApproval = await prisma.step.create({
    data: {
      workflow_id: workflow.id,
      name: 'Manager Approval',
      step_type: 'APPROVAL',
      order: 1,
      metadata: {}
    }
  });

  const financeNotification = await prisma.step.create({
    data: {
      workflow_id: workflow.id,
      name: 'Finance Notification',
      step_type: 'NOTIFICATION',
      order: 2,
      metadata: {}
    }
  });

  const ceoApproval = await prisma.step.create({
    data: {
      workflow_id: workflow.id,
      name: 'CEO Approval',
      step_type: 'APPROVAL',
      order: 3,
      metadata: {}
    }
  });

  const taskRejection = await prisma.step.create({
    data: {
      workflow_id: workflow.id,
      name: 'Task Rejection',
      step_type: 'TASK',
      order: 4,
      metadata: {}
    }
  });

  // 3. Set Start Step
  await prisma.workflow.update({
    where: { id: workflow.id },
    data: { start_step_id: managerApproval.id }
  });

  // 4. Create Rules for Manager Approval
  // amount > 100 && country == "US" && priority == "High" → Finance Notification
  await prisma.rule.create({
    data: {
      step_id: managerApproval.id,
      condition: 'amount > 100 && country == "US" && priority == "High"',
      next_step_id: financeNotification.id,
      priority: 1
    }
  });

  // amount <= 100 → CEO Approval
  await prisma.rule.create({
    data: {
      step_id: managerApproval.id,
      condition: 'amount <= 100',
      next_step_id: ceoApproval.id,
      priority: 2
    }
  });

  // DEFAULT → Task Rejection
  await prisma.rule.create({
    data: {
      step_id: managerApproval.id,
      condition: 'DEFAULT',
      next_step_id: taskRejection.id,
      priority: 3
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

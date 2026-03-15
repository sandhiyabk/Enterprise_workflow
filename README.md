# Workflow Automation Engine

A production-quality workflow automation system built with React, Node.js, and PostgreSQL (via Prisma).

## Features

- **Visual Workflow Designer**: Build workflows using a drag-and-drop interface powered by React Flow.
- **Dynamic Rule Engine**: Evaluate complex logic expressions at runtime.
- **Stateful Execution**: Track progress, logs, and state across multiple steps.
- **Approval Steps**: Support for asynchronous human-in-the-loop approvals.
- **Audit Logs**: Detailed step-by-step trace of every execution.
- **Fault Tolerance**: Retry failed steps and cancel running workflows.

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, React Flow, React Query.
- **Backend**: Node.js, Express, TypeScript, Prisma.
- **Database**: PostgreSQL (Prisma ORM).

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (optional, can be adapted to SQLite)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/workflow_engine"
   ```
4. Push the schema to your database:
   ```bash
   npx prisma db push
   ```
5. Seed the sample workflow:
   ```bash
   npm run seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Sample Workflow: Expense Approval

- **Input**: amount, country, priority.
- **Rules**:
  - Large amount + US + High Priority -> Finance Notification.
  - Small amount -> CEO Approval.
  - Others -> Task Rejection.

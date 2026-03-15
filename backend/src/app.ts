import express from 'express';
import cors from 'cors';
import workflowRoutes from './routes/workflowRoutes.js';
import stepRoutes from './routes/stepRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';
import executionRoutes from './routes/executionRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/workflows', workflowRoutes);
app.use('/steps', stepRoutes);
app.use('/rules', ruleRoutes);
app.use('/executions', executionRoutes);

export default app;

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import workflowRoutes from './routes/workflows';
import executionRoutes from './routes/executions';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);

app.listen(PORT, () => {
    console.log(`API Server running on http://localhost:${PORT}`);
});

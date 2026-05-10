import 'dotenv/config.js';
import express from 'express';
import { toNodeHandler } from '@swift-auth/node';
import auth from './lib/auth.js';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(toNodeHandler(auth));

app.get('/', (_req, res) => {
   console.log('received req');
   res.send('Testing node server for swift auth');
});

app.listen(8000, '0.0.0.0', () => {
   console.log('Testing node server started on port 8000');
}).on('error', (err) => {
   console.error('Listen error:', err);
});

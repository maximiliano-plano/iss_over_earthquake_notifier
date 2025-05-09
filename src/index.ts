import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import { storeWebhook } from './api/notifications.controller'; 

const app: Application = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/notifications/web_hooks', storeWebhook.bind(this));

const server = app.listen(port, () => {
  console.log(`Server is Running at port ${port}`);
});

export {server};

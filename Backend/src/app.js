import 'dotenv/config';
import express from 'express';

import coursesRoutes from './routes/courses.routes.js';
import usersRoutes from './routes/users.routes.js';
import authRoutes from './routes/auth.routes.js';
import enrollmentsRoutes from './routes/enrollments.routes.js';
import dashboardRoutes from "./routes/dashboard.routes.js";


const app = express();



// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowed = new Set([
    "http://localhost:5173",
    "http://localhost:5174",
  ]);

  if (origin && allowed.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});


app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/courses', coursesRoutes);
app.use('/users', usersRoutes);
app.use('/enrollments', enrollmentsRoutes);
app.use("/dashboard", dashboardRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok!' });
});

export default app;

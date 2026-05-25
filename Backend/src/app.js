import 'dotenv/config';
import express from 'express';

import coursesRoutes from './routes/courses.routes.js';
import usersRoutes from './routes/users.routes.js';
import authRoutes from './routes/auth.routes.js';
import enrollmentsRoutes from './routes/enrollments.routes.js';
import dashboardRoutes from "./routes/dashboard.routes.js";
import notFound from './middlewares/notfound.js';
import errorHandler from "./middlewares/errorHandler.js";


const app = express();



// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowedOrigins = ["http://localhost:5173" , "http://127.0.0.1:5137"]

  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
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

app.use(notFound);
app.use(errorHandler);


export default app;

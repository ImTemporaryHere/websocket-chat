// src/index.js
import express, { Express, Request, Response } from "express";
import mongoose from 'mongoose'
import {usersRouter} from "./users/users.router";

const app: Express = express();
const port = process.env.PORT || 3000;


// MongoDB Connection URI
const mongoURI = process.env.MONGODB_URI as string;

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI);

// Connection Events
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');


  // Middleware to parse JSON requests
  app.use(express.json());

  app.use('/users',usersRouter)



  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });

});

mongoose.connection.on('error', (err:any) => {
  console.error('Failed to connect to MongoDB', err);
});



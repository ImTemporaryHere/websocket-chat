import mongoose from "mongoose";
import { stopServiceCallback } from "./jest.setup";

export default async function globalTeardown() {
  try {
    await stopServiceCallback();
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  } catch (e) {
    console.error(e);
  }
}

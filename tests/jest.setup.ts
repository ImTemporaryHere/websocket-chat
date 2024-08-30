import { runApp } from "../src/app";
import { config } from "dotenv";
import mongoose from "mongoose";

config({ path: `envs/.env.${process.env.NODE_ENV}` });

export let stopServiceCallback: () => Promise<void>;

export default async function globalSetup() {
  stopServiceCallback = await runApp();
}

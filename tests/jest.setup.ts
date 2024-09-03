import { runApp } from "../src/app";
import { config } from "dotenv";

config({ path: `envs/test/.env.${process.env.NODE_ENV}` });

export let stopServiceCallback: () => Promise<void>;

export default async function globalSetup() {
  stopServiceCallback = await runApp();
}

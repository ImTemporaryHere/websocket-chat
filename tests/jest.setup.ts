import { runApp } from "../src/app";
import { config } from "dotenv";

config({ path: `envs/.env.${process.env.NODE_ENV}` });

let stopServiceCallback: () => Promise<void>;

beforeAll(async () => {
  stopServiceCallback = await runApp();
});

afterAll(async () => {
  try {
    await stopServiceCallback();
  } catch (e) {
    console.error(e);
  }
});

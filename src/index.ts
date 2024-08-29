import { runApp } from "./app";
import { config } from "dotenv";

config({ path: `envs/.env.${process.env.NODE_ENV}` });

runApp();

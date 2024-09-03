import { getRandomUserData } from "../test-utils/generators";
import { ActionFn, BeforeRequestFn } from "artillery";
import { config } from "dotenv";
import mongoose, { Schema } from "mongoose";

config({ path: `envs/.env.${process.env.NODE_ENV}` });

export const setUserData: BeforeRequestFn = (
  requestParams,
  context,
  ee,
  next,
) => {
  const data = getRandomUserData();
  // Set the "query" variable for the virtual user.

  for (const key in data) {
    context.vars[key] = data[key];
  }

  next();
};
/*
export const setGroupIdInContextForUser: ActionFn = async (context) => {
  try {
    if (!mongoose.connection) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const userId1 = context.vars["userId"];

    const group = await groupsRepository.findOne({
      ownerId: new mongoose.Types.ObjectId(userId1 as string) as any,
    });

    if (!group) {
      throw new Error(`no group found with owner id ${context.vars["userId"]}`);
    }
    context.vars["groupId"] = group._id;
  } catch (e) {
    console.error(e);
  }
};*/

export const dropDataBase: ActionFn = async (context) => {
  await mongoose.connect(process.env.MONGODB_URI!);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
};

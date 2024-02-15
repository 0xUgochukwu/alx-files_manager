import Queue from "bull/lib/queue";
import imageThumbnail from "image-thumbnail";
import fs from 'fs';
import { ObjectId } from 'mongodb';

import dbClient from "./utils/db";

export const fileQueue = new Queue("Thumbnail Generation");
export const userQueue = new Queue("User Welcome email");

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;
  if (!fileId) {
    throw new Error("Missing fileId");
  }
  if (!userId) {
    throw new Error("Missing userId");
  }
  const file = await dbClient.findFile({ _id: ObjectId(fileId), userId: ObjectId(userId) });
  if (!file) {
    throw new Error("File not found");
  }
  const { localPath } = file;

  const widths = [500, 250, 100];

  widths.forEach(async (width) => {
    const thumbnail = await imageThumbnail(localPath, { width });
    fs.writeFileSync(`${localPath}_${width}`, thumbnail);
  });
});


userQueue.process(async (job) => {
  const { userId } = job.data;
  if (!userId) {
    throw new Error("Missing userId");
  }
  const user = await dbClient.findUser({ _id: ObjectId(userId) });
  if (!user) {
    throw new Error("User not found");
  }
  console.log(`Welcome ${user.email}!`);
});

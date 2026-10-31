import mongoose from "mongoose";
import config from "../config";

export async function connectDatabase() {
  console.log(`Connecting to database...`);

  await mongoose.connect(config.dbURI);

  console.log("Database connected successfully");
}

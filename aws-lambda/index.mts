import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.DB_URI!;
const DB_NAME = process.env.DB_NAME!;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);

  await client.connect();

  return client.db(DB_NAME).collection("users");
}

export async function handler(event: {
  Records: { s3: { object: { key: string } } }[];
}) {
  const db = await connectDB();

  for (const record of event.Records) {
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log("key:", key);

    // uploads/{user-id}/{folder-name}/{file-name}
    const [, userId, fieldname, filename] = key.split("/");

    console.log("userId:", userId);

    if (!userId || !fieldname || !filename) {
      console.error("Invalid key format:", key);
      continue;
    }

    try {
      let updateData = {};

      if (fieldname === "coverImages") {
        updateData = { $addToSet: { coverImages: key } };
      } else {
        updateData = { $set: { [fieldname]: key } };
      }

      const result = await db.updateOne(
        { _id: new ObjectId(userId) },
        updateData,
      );

      console.log("result:", result);
    } catch (error) {
      console.error(`Error processing record with key ${key}:`, error);
    }
  }
}

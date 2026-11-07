import { Types } from "mongoose";

export function toObjectId(id: string) {
  return new Types.ObjectId(id);
}

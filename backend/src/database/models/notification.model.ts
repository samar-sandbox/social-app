import { model, Schema } from "mongoose";
import { NOTIFICATION_TYPE } from "../../common/enums";
import type { TModel } from "../../common/types";
import type { INotification } from "../types/notification.type";

const schema = new Schema<INotification, TModel<INotification>>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPE,
      default: NOTIFICATION_TYPE.ANY,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, strict: true, strictQuery: false },
);

export const Notification = model("notification", schema);

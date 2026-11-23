import type { NOTIFICATION_TYPE } from "../../common/enums";
import type { THydratedDocument } from "../../common/types";
import type { Types } from "mongoose";

export interface INotification {
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  target: Types.ObjectId;
  type: NOTIFICATION_TYPE;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TNotificationHydratedDoc = THydratedDocument<INotification>;

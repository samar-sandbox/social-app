import {
  type INotification,
  Notification,
  DatabaseRepository,
} from "../../../database";

class NotificationRepository extends DatabaseRepository<INotification> {
  constructor() {
    super(Notification);
  }
}

const notificationRepository = new NotificationRepository();

export { notificationRepository };

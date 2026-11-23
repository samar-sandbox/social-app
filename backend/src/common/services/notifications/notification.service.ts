import { type App, cert, initializeApp } from "firebase-admin/app";
import {
  getMessaging,
  Messaging,
  Notification,
  SendResponse,
} from "firebase-admin/messaging";
import { buildUserKey, redisService } from "../redis";
import config from "../../../config";

export class NotificationService {
  private app: App;
  private messaging: Messaging;

  constructor() {
    this.app = initializeApp({
      credential: cert(config.firebaseServiceAccountPath),
    });

    this.messaging = getMessaging(this.app);
  }

  private buildFCMKey(userId: string) {
    return buildUserKey(userId, "FCM:FIDs");
  }

  async storeFID(userId: string, installationId: string) {
    const key = this.buildFCMKey(userId);

    const added = await redisService.sAdd(key, installationId);

    if (added) {
      console.log(`Stored new FID ${installationId} for user ${userId}`);
    }
  }

  async getFIDs(userId: string) {
    const key = this.buildFCMKey(userId);

    return redisService.sMembers(key);
  }

  async deleteFIDs(userId: string, installationIds: string[]) {
    const key = this.buildFCMKey(userId);

    await redisService.sRem(key, installationIds);

    console.log(`Deleted ${installationIds.length} FIDs`);
  }

  private checkResponses(
    userId: string,
    fids: string[],
    responses: SendResponse[],
  ) {
    const staleFids = fids.filter(
      (_, i) =>
        responses[i]?.error?.code ===
        "messaging/installation-id-not-registered",
    );

    if (staleFids.length) {
      void this.deleteFIDs(userId, staleFids);
    }

    const messages = responses
      .map((r) => {
        if (r.success) {
          return `Success: ${r.messageId}`;
        }
        return `Fail: ${r.error?.message}`;
      })
      .join("\n");

    return messages;
  }

  async sendNotification(userId: string, notification: Notification) {
    const fids = await this.getFIDs(userId);

    if (!fids.length) {
      console.log(`No FIDs found for user ${userId}`);
      return;
    }

    const { failureCount, successCount, responses } =
      await this.messaging.sendEachForMulticast({
        fids,
        notification,
      });

    const messages = this.checkResponses(userId, fids, responses);

    console.log(
      `Successfully sent ${successCount} messages. Failures: ${failureCount}.\n${messages}`,
    );
  }
}

const notificationService = new NotificationService();

export { notificationService };

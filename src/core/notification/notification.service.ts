import { Earthquake } from "../earthquake/earthquake.interface";
import EarthquakeRepository from "../earthquake/earthquake.repository";
import NotificationQueueProvider from "./notification_queue.provider";

export class NotificationService {
  constructor(private readonly earthquakeRepository: EarthquakeRepository,
    private readonly notificationQueueProvider: NotificationQueueProvider,
  ) {}

  async storeWebhook(webhook: {url: string}): Promise<void> {
    throw new Error("Method not yet implemented!");
  }

  async notifyOverlap(earthquake: Earthquake, issLocation: Location): Promise<void> {
    await this.earthquakeRepository.atomicUpsert(
      {...earthquake, notification_sent: true}, 
      { _id: earthquake._id, notification_sent: undefined }
    );

    try {
      await this.notificationQueueProvider.publish({ earthquake, issLocation });
    } catch (error) {
      console.log("")
      await this.earthquakeRepository.atomicUpsert(
        { ...earthquake, notification_sent: false }, 
        { _id: earthquake._id, notification_sent: true }
      );
    }
  }

  /**
   * 
   * @param notification 
   */
  async sendWebhookNotification(notification: Notification): {
    this.earthquakeRepository.
    webhookRepository.find({});
  }
}

export default async function NotificationServiceFactory() {
  return new NotificationService();
}

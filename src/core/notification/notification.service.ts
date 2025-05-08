import { Earthquake } from "../earthquake/earthquake.interface";

export class NotificationService {
  constructor() {}

  async storeWebhook(webhook: {url: string}): Promise<void> {
    throw new Error("Method not yet implemented!");
  }

  async notifyEarthquake(earthquake: Earthquake): Promise<void> {
    throw new Error("Method not yet implemented!");
  }
}

export default async function NotificationServiceFactory() {
  return new NotificationService();
}

import { Earthquake } from "../earthquake/earthquake.interface";

export class NotificationService {
  constructor() {}

  async storeWebhook(): Promise<void> {
    throw new Error("Method not yet implemented!");
  }

  async notifyEarthquake(earthquake: Earthquake): Promise<void> {
    throw new Error("Method not yet implemented!");
  }
}

export default async function NotificationServiceFactory() {
  return new NotificationService();
}

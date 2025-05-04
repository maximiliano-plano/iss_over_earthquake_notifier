/*import { Earthquake } from './core/earthquake/earthquake.interface';
import EarthquakeServiceFactory from './core/earthquake/earthquake.service';
import IssTrackingServiceFactory from './core/iss_tracking/iss_tracking.service';
import NotificationServiceFactory from './core/notification.service';

export default async function run(): Promise<void> {
    const earthquakeService = await EarthquakeServiceFactory();
    const issTrackingService = await IssTrackingServiceFactory();
    const notificationService = await NotificationServiceFactory();
    
    while (true) {
      const issCurrentLocation = await issTrackingService.getCurrentLocation();
      
      const earthquakes: Earthquake[] = await earthquakeService.getEarthquakes({
        startTime: process.env.,
        endTime: process.env,
        minmumMagnitude: process.env.,
        limit: process.env.,
        maximumRadius: process.env.,
        center: issCurrentLocation
      });

      await Promise.all(earthquakes.map(async (earthquake) => {
        await notificationService.notifyEverybody(earthquake);
        await earthquakeService.saveEarthquake({ ...earthquake, notification_sent: true });
        console.log('Notification sent!');
      }));
    }
}
*/

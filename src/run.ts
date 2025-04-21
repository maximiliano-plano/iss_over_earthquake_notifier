import EarthquakeServiceFactory from './core/earthquake/earthquake.service';
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const intervalInSeconds = process.env.CHECK_INTERVAL_IN_SECONCDS 
    ? parseInt(process.env.CHECK_INTERVAL_IN_SECONCDS)
    : 60;

export default async function run(): Promise<void> {
    const earthquakeService = EarthquakeServiceFactory();
    
    while (true) {
      const earthquakes = await earthquakeService.getEarthquakes({minmumMagnitude: 5});
      const issCurrentLocation = await issService.getCurrentLocation();
      const issOverEarthquake = await issService.isOverEarthquake(earthquakes, issCurrentLocation);
      if(issOverEarthquake) {
        const hasNotificationBeenSent = await notificationService.getNotification(issOverEarthquake);
        if(hasNotificationBeenSent) {
          await notificationService.notifyAll();
          notificationService.storeNotification(issOverEarthquake);
          console.log('Notification sent!');
        }
      }
      sleep(intervalInSeconds * 1000);
    }
}


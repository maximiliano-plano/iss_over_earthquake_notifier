import { Earthquake } from './core/earthquake/earthquake.interface';
import EarthquakeServiceFactory from './core/earthquake/earthquake.service';
import IssTrackingServiceFactory from './core/iss_tracking/iss_tracking.service';
import NotificationServiceFactory from './core/notification.service';
import { getEnvarOrDefault } from './util';
import { Location } from './core/iss_tracking/iss_tracking.service'

const earthquakesMaximumAgeInSeconds = getEnvarOrDefault<number>('EARTHQUAKES_MAXIMUM_AGE_IN_SECONDS', 3600);
const earthquakesMinimumAgeInSeconds = getEnvarOrDefault<number>('EARTHQUAKES_MINIMUM_AGE_IN_SECONDS', 300);
const earthquakesMinimumMaginitudInMl = getEnvarOrDefault<number>('EARTHQUAKES_MINIMUM_MAGNITUD_IN_ML', 2.0);
const earthquakeResultLimit = getEnvarOrDefault<number>('EARTHQUAKES_RESULT_LIMIT', 100);
const earthquakesMaximumRadiusInKm = getEnvarOrDefault<number>('EARTHQUAKES_MAXIMUM_RADIUS_IN_KM', 100);

export default async () => {
  const earthquakeService = await EarthquakeServiceFactory();
  const issTrackingService = await IssTrackingServiceFactory();
  const notificationService = await NotificationServiceFactory();
  
  earthquakeService.fetchAndInsertEarthquakes();
  const issCurrentLocation: Location | undefined = await issTrackingService.getCurrentLocation();
  if(issCurrentLocation) {
    const earthquakes: Earthquake[] = await earthquakeService.getEarthquakes({
      startTime: new Date(Date.now() - earthquakesMaximumAgeInSeconds * 1000),
      endTime: new Date(Date.now() - earthquakesMinimumAgeInSeconds * 1000),
      minmumMagnitude: earthquakesMinimumMaginitudInMl,
      limit: earthquakeResultLimit,
      maximumRadiusInKm: earthquakesMaximumRadiusInKm,
      center: issCurrentLocation
    });

    await Promise.all(earthquakes.map(async (earthquake) => {
      await notificationService.notifyEverybody(earthquake);
      await earthquakeService.saveEarthquake({ ...earthquake, notification_sent: true });
      console.log('Notification sent!');
    }));
  }
}

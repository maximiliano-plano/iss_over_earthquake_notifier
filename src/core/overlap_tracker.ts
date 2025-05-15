import { Earthquake } from './earthquake/earthquake.interface';
import EarthquakeServiceFactory, { EarthquakeService } from './earthquake/earthquake.service';
import IssTrackingServiceFactory, { IssTrackingService, Location } from './iss_tracking/iss_tracking.service';
import NotificationServiceFactory, { NotificationService } from './notification/notification.service';
import { getEnvarOrDefault } from '../util';

const earthquakesMaximumAgeInSeconds = getEnvarOrDefault<number>('EARTHQUAKES_MAXIMUM_AGE_IN_SECONDS', 3600);
const earthquakesMinimumAgeInSeconds = getEnvarOrDefault<number>('EARTHQUAKES_MINIMUM_AGE_IN_SECONDS', 300);
const earthquakesMinimumMaginitudInMl = getEnvarOrDefault<number>('EARTHQUAKES_MINIMUM_MAGNITUD_IN_ML', 2.0);
const earthquakeResultLimit = getEnvarOrDefault<number>('EARTHQUAKES_RESULT_LIMIT', 100);
const earthquakesMaximumRadiusInKm = getEnvarOrDefault<number>('EARTHQUAKES_MAXIMUM_RADIUS_IN_KM', 100);

export class OverlapTracker {
  
  public constructor(
    private readonly earthquakeService: EarthquakeService,
    private readonly issTrackingService: IssTrackingService,
    private readonly notificationService: NotificationService
  ){ }

  async run() {
    this.earthquakeService.fetchAndInsertEarthquakes();
    const issCurrentLocation: Location | undefined = await this.issTrackingService.getCurrentLocation();
    if(issCurrentLocation) {
      const earthquakes: Earthquake[] = await this.earthquakeService.getEarthquakes({
        startTime: new Date(Date.now() - earthquakesMaximumAgeInSeconds * 1000),
        endTime: new Date(Date.now() - earthquakesMinimumAgeInSeconds * 1000),
        minmumMagnitude: earthquakesMinimumMaginitudInMl,
        limit: earthquakeResultLimit,
        maximumRadiusInKm: earthquakesMaximumRadiusInKm,
        center: issCurrentLocation
      });

      await Promise.all(earthquakes.map(async (earthquake) => {
        await this.notificationService.notifyOverlap(earthquake);
        console.log('Notification sent!');
      }));
    }

  }
}

export default async function OverlapTrackerFactory() {
  const earthquakeService = await EarthquakeServiceFactory();
  const issTrackingService = await IssTrackingServiceFactory();
  const notificationService = await NotificationServiceFactory();
  
  return new OverlapTracker(earthquakeService, issTrackingService, notificationService);
}

import RestIssLocationProviderFactory from '../../infrastructure/iss_tracking/rest_iss_location.provider';
import { IssLocationProvider } from './iss_location.provider'
import { getEnvarOrDefault, pause } from '../../util';

export interface Location {
    latitude: number;
    longitude: number;
}

export class IssTrackingService {
    constructor(private readonly issProvider: IssLocationProvider,
        private readonly attempts: number,
        private readonly watingTimeInSeconds: number
    ) { }

    /**
     * Retrives the current location of the ISS. In case of error
     * it will return an undefined.
     * 
     * @returns {Location?} current location of the iss
     */
    async getCurrentLocation(): Promise<Location | undefined> {
        return this.retry<Location>(this.issProvider.getCurrentLocation);
    }

    private async retry<T>(callback: () => Promise<T>): Promise<T | undefined> {
        for (let i = 0; i < this.attempts; i++) {
            try {
                const res = await callback();
                return res;
            } catch (error) {
                console.error('Error while fetching ISS current location');
            }
            console.warn('Retrying fetching ISS current location');
        }
        await pause(this.watingTimeInSeconds);
    }
}

export default async function IssTrackingServiceFactory() {
    const issProvider = RestIssLocationProviderFactory();
    const amountOfAttempts = getEnvarOrDefault('REST_PROVIDER_RETRIER_ATTEMPTS_AMOUNT', 3);
    const elapseTime = getEnvarOrDefault('REST_PROVIDER_RETRIER_ELAPSE_TIME_IN_SECONDS', 5);

    return new IssTrackingService(issProvider, amountOfAttempts, elapseTime);
}

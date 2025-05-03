import {Location} from './iss_tracking.service';

export abstract class IssLocationProvider {
    abstract getCurrentLocation(): Promise<Location>;
}
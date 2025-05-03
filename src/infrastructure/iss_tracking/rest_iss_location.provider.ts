import { IssLocationProvider } from '../../core/iss_tracking/iss_location.provider';
import {Location} from '../../core/iss_tracking/iss_tracking.service'
import axios from 'axios';

export class RestIssLocationProvider implements IssLocationProvider {
    private readonly apiClient: Axios.AxiosInstance;

    constructor(baseURL: string) {
        this.apiClient = axios.create({
            baseURL,
            timeout: 5000,
        });
    }

    async getCurrentLocation(): Promise<Location> {
        try {
            const {data} = await this.apiClient.get<Location>('');
            return {
                latitude: data.latitude,
                longitude: data.longitude,
            };
        } catch(error) {
            console.error('Error fetching iss location data:', error);
            throw new Error('Failed to fetch iss location data');
        }
    }
}

export default function RestIssLocationProviderFactory() {
    const baseUrl = process.env.ISS_LOCATION_API_URL;
    if (!baseUrl) {
        throw new Error('ISS_LOCATION_API_URL environment variable is not set');
    }    

    return new RestIssLocationProvider(baseUrl);
}
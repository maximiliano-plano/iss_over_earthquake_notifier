import axios from 'axios';
import EarthquakeProvider from '../../core/earthquake/earthquake.provider'
import { Earthquake } from '../../core/earthquake/earthquake.interface';
import { getEnvarOrDefault, getEnvarOrThrow } from '../../util';

interface FeatureCollection {
    features: {
        properties: {
            mag: number,
            place: string,
            time: number
        },
        geometry: {
            coordinates: number[],
        },
        id: string
    }[]
}

export class UsgsEarthquakeProvider implements EarthquakeProvider {
    private readonly apiClient: Axios.AxiosInstance;

    constructor( baseURL: string,
        private readonly startIntervalInHours: number ) {
        this.apiClient = axios.create({
            baseURL,
            timeout: 5000,
        });
    }

    async fetchLastEarthquakes(): Promise<Earthquake[]> {
        try {
            const { data } = await this.apiClient.get<FeatureCollection>('/query', {
                params: {
                    starttime: this.calculateStartTime()
                }
            });
            return this.mapReponse(data.features);
        } catch (error) {
            console.error('Error fetching earthquake data:', error);
            throw new Error('Failed to fetch earthquake data');
        }
    }

    private mapReponse(features: FeatureCollection['features']): Earthquake[] {
        return features.map(f => ({
            magnitude: f.properties.mag,
            place: f.properties.place,
            time: new Date(f.properties.time),
            location: {
                coordinates: f.geometry.coordinates, 
                type: 'Point'
            },
            external_id: f.id,
            notification_sent: false
        }))
    }

    private calculateStartTime(): string {
        const startTime: number = Date.now() - 
            this.startIntervalInHours * 60 * 60 * 1000;
        
        return new Date(startTime).toISOString().slice(0, 10);
    }
}

export default function UsgsEarthquakeProviderFactory() {
    const baseUrl = getEnvarOrThrow<string>('USGS_BASE_URL');
    const startIntervalInHours = getEnvarOrDefault<number>('USGS_LAST_EARTHQUAKES_INTERVAL_IN_HOUR', 1);

    return new UsgsEarthquakeProvider(baseUrl, startIntervalInHours);
};
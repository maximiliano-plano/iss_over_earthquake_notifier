import axios from 'axios';
import EarthquakeProvider from '../core/earthquake/earthquake.provider'
import { Earthquake } from '../core/earthquake/earthquake.interface';
import { QueryParams } from '../core/earthquake/earthquake.service';

interface FeatureCollection {
    features: {
        properties: {
          mag: number,
          place: string,
          time: number
        },
        geometry: {
          coordinates: number[]
        },
        id: string
    }[]
}

export class UsgsEarthquakeProvider implements EarthquakeProvider {
    private readonly apiClient: Axios.AxiosInstance;

    constructor(baseURL: string) {
        this.apiClient = axios.create({
            baseURL,
            timeout: 5000,
        });
    }

    async fetchEarthquakes(params: QueryParams): Promise<Earthquake[]> {
        try {
            const { data } = await this.apiClient.get<FeatureCollection>('/query', {
                    params: this.mapQueryParams(params)
                });
            return data.features.map( f => ({
                magnitude: f.properties.mag,
                place: f.properties.place,
                time: new Date(f.properties.time),
                coordinates: f.geometry.coordinates,
            }));
        } catch (error) {
            console.error('Error fetching earthquake data:', error);
            throw new Error('Failed to fetch earthquake data');
        }
    }

    private mapQueryParams(params: QueryParams) {
        return {
            format: "geojson",
            starttime: params.startTime?.toISOString().slice(0, 10),
            endtime: params.endTime?.toISOString().slice(0, 10),
            minmagnitude: params.minmumMagnitude,
            maxradius: params.maximumRadius,
            latitude: params.center?.latitude,
            longitude: params.center?.longitude,
            limit: params.limit
        }
    }
}

export default function UsgsEarthquakeProviderFactory() {
    if (!process.env.USGS_BASE_URL) {
        console.warn('USGS_BASE_URL is not set, using default URL');
    }

    const baseURL = process.env.USGS_BASE_URL ?? 'https://earthquake.usgs.gov/fdsnws/event/1';
    return new UsgsEarthquakeProvider(baseURL);
};
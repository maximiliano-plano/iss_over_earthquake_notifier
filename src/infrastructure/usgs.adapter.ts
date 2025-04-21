import axios from 'axios';
import EarthquakeAdapter, { QueryParams } from '../core/earthquake/earthquake_adapter.abstract'
import { Earthquake } from '../core/earthquake/earthquake.interface';

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

export class UsgsAdapter implements EarthquakeAdapter {
    private readonly apiClient: Axios.AxiosInstance;

    constructor(baseURL: string) {
        this.apiClient = axios.create({
            baseURL,
            timeout: 5000,
        });
    }

    async getEarthquakes(params: QueryParams): Promise<Earthquake[]> {
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
        }
    }
}

export default function UsgsAdapterFactory() {
    if (!process.env.USGS_BASE_URL) {
        console.warn('USGS_BASE_URL is not set, using default URL');
    }

    const baseURL = process.env.USGS_BASE_URL ?? 'https://earthquake.usgs.gov/earthquakes';
    return new UsgsAdapter(baseURL);
};
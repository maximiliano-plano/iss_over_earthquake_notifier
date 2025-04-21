import axios from 'axios';

interface FeatureCollection {
    features: {
        "properties": {
          "mag": number,
          "place": string,
          "time": number,
          "updated": number,
          "magType": "ml",
          "type": "earthquake",
        },
        "geometry": {
          "type": "Point",
          "coordinates": number[]
        },
        "id": string
    }[]
}

export class UsgsAdapter {
    private readonly apiClient: Axios.AxiosInstance;

    constructor(baseURL: string) {
        this.apiClient = axios.create({
            baseURL,
            timeout: 5000,
        });
    }

    async getAllHourEarthquakes(): Promise<FeatureCollection> {
        try {
            const response = await this.apiClient
                .get<FeatureCollection>('/feed/v1.0/summary/all_hour.geojson');
            return response.data;
        } catch (error) {
            console.error('Error fetching all hour earthquake data:', error);
            throw new Error('Failed to fetch earthquake data');
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
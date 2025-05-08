
import { Earthquake } from "./earthquake.interface";
import EarthquakeProvider from "./earthquake.provider";
import EarthquakeRepository from "./earthquake.repository";
import UsgsEarthquakeProviderFactory from "../../infrastructure/earthquake/rest_usgs_earthquake.provider";
import MongoEarthquakeRepositoryFactory from "../../infrastructure/earthquake/mongo.earthquake_repository";

export interface QueryParams {
    startTime: Date,
    endTime: Date,
    minmumMagnitude: number,
    limit: number,
    maximumRadiusInKm: number,
    center: {
        latitude: number,
        longitude: number
    },
}

export class EarthquakeService {
    constructor(private readonly earthquakeProvider: EarthquakeProvider,
        private readonly earthquakeRepository: EarthquakeRepository) {
    }

    /**
     * Fetches earthquakes near params.center from the provider, 
     * saves them in the repository and queries the repository for the actual earthquakes.
     * 
     * 
     * @param params Query parameters to filter earthquakes.
     */
    async getEarthquakes(params: QueryParams): Promise<Earthquake[]> {
        return this.earthquakeRepository.get(params);
    }

    /**
     * It pulls last earthquakes from provider and stores them in the repository.
     */
    async fetchAndInsertEarthquakes(): Promise<void> {
        try {
            const lastEarthquakes = await this.earthquakeProvider.fetchLastEarthquakes();
            await Promise.all(lastEarthquakes.map(e =>
                this.earthquakeRepository.atomicUpsert(e, { external_id: e.external_id })
            ));
        } catch(error) {
            console.error("Failed to add new earthquakes from provider.");
        }
    }

    /**
     * 
     * 
     */
    async saveEarthquake(earthquake: Earthquake): Promise<Earthquake> {
        throw new Error('Method not implimented yet.');
    }
}

export default async function EarthquakeServiceFactory() {
    const usgsProvider = UsgsEarthquakeProviderFactory();
    const mongoRepository = await MongoEarthquakeRepositoryFactory();

    return new EarthquakeService(usgsProvider, mongoRepository);
};

import { Earthquake } from "./earthquake.interface";
import EarthquakeProvider from "./earthquake.provider";
import EarthquakeRepository from "./earthquake.repository";
import UsgsEarthquakeProviderFactory from "../../infrastructure/usgs.earthquake_provider";
import MongoEarthquakeRepositoryFactory from "../../infrastructure/mongo.earthquake_repository";

export interface QueryParams {
    startTime: Date,
    endTime: Date,
    minmumMagnitude: number,
    limit: number,
    maximumRadius: number,
    center: {
        latitude: number,
        longitude: number
    },
}

export class EarthquakeService {    
    constructor(private readonly earthquakeProvider: EarthquakeProvider, 
        private readonly earthquakeRepository: EarthquakeRepository, 
        private readonly minimumAge: number) {
    }

    /**
     * Fetches earthquakes near params.center from the provider, 
     * saves them in the repository and queries the repository for the actual earthquakes.
     * 
     * 
     * @param params Query parameters to filter earthquakes.
     */
    async getAndInsertEarthquakes(params: QueryParams): Promise<Earthquake[]> {
        throw new Error('Method not implemented.');
    }
}

export default async function EarthquakeServiceFactory() {
    const usgsProvider = UsgsEarthquakeProviderFactory();
    const mongoRepository = await MongoEarthquakeRepositoryFactory();
    const minimumAge = process.env.MINIMUM_AGE_IN_SEC 
        ? parseInt(process.env.MINIMUM_AGE_IN_SEC) 
        : 5;

    return new EarthquakeService(usgsProvider, mongoRepository, minimumAge);
};
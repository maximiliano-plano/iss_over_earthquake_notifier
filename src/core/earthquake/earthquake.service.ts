import UsgsAdapterFactory from "../../infrastructure/usgs.adapter";
import { Earthquake } from "./earthquake.interface";
import EarthquakeAdapter, { QueryParams } from "./earthquake_adapter.abstract";

export class EarthquakeService {
    private readonly earthquakeAdapter: EarthquakeAdapter;
    
    constructor(earthquakeAdapter: EarthquakeAdapter) {
        this.earthquakeAdapter = earthquakeAdapter;
    }


    async getEarthquakes(params: QueryParams): Promise<Earthquake[]> {
        return this.earthquakeAdapter.getEarthquakes(params);
    }
}

export default function EarthquakeServiceFactory() {
    const earthquakeAdapter: EarthquakeAdapter = UsgsAdapterFactory();

    return new EarthquakeService(earthquakeAdapter);
};
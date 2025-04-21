import UsgsAdapterFactory, {UsgsAdapter} from "../adapters/usgs.adapter";

class EarthquakeService {
    private readonly usgsAdapter: UsgsAdapter;
    
    constructor(usgsAdapter: UsgsAdapter) {
        this.usgsAdapter = usgsAdapter;
    }

    async getEarthquakes(): Promise<any> {
        return this.usgsAdapter.getAllHourEarthquakes();
    }
}

export function EarthquakeServiceFactory() {
    const usgs:UsgsAdapter = UsgsAdapterFactory();

    return new EarthquakeService(usgs);
};
import { UsgsEarthquakeProvider } from "./usgs.earthquake_provider";
import { QueryParams } from '../core/earthquake/earthquake.service'

describe('UsgsEarthquakeProvider', () => {
    it('should fetch earthquake data from USGS', async () => {
        const usgsProvider = new UsgsEarthquakeProvider('https://earthquake.usgs.gov/fdsnws/event/1');
        const params: QueryParams = {
            startTime: new Date('2023-01-01'),
            endTime: new Date('2023-01-02'),
            minmumMagnitude: 5.0, 
            limit: 10,
            maximumRadius: 100,
            center: {
                latitude: 37.7749,
                longitude: -122.4194
            }
        };
        const data = await usgsProvider.fetchEarthquakes(params);

        expect(data).toBeDefined();
        expect(data.length).toBeGreaterThan(0);
    });

    it('should handle errors when fetching earthquake data', async () => {
        const usgsProvider = new UsgsEarthquakeProvider('https://invalid-url.com');
        const params: QueryParams = {
            startTime: new Date('2023-01-01'),
            endTime: new Date('2023-01-02'),
            minmumMagnitude: 5.0,
        };
        await expect(usgsProvider.fetchEarthquakes(params)).rejects.toThrow('Failed to fetch earthquake data');
    });
});
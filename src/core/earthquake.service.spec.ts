
import { EarthquakeServiceFactory } from "./earthquake.service";

describe('EarthquakeService', () => {
    const EarthquakeService = EarthquakeServiceFactory();

    beforeEach(() => {
    });

    it('should be defined', () => {
        expect(EarthquakeService).toBeDefined();
    });

    describe('getEarthquakes', () => {
        it('should return an array of earthquakes', async () => {
            const mockResponse = {
                data: [
                    { id: '1', magnitude: 5.0, location: 'Location 1' },
                    { id: '2', magnitude: 6.0, location: 'Location 2' },
                ],
            };

            const result = await EarthquakeService.getEarthquakes();

            expect(result).toEqual(mockResponse.data);
        });
    });
});
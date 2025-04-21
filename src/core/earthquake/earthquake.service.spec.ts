
import {EarthquakeService} from "./earthquake.service";
import EarthquakeAdapter from "./earthquake_adapter.abstract";

class MockEarthquakeAdapter extends EarthquakeAdapter {
    getEarthquakes = jest.fn().mockResolvedValue([{ 
        magnitude: 6.5, 
        place: '32 km W of Sola, Vanuatu', 
        time: new Date(1388592209000), 
        coordinates: [ 167.249, -13.8633, 187 ] 
    }]);
}


describe('EarthquakeService', () => {
    let earthquakeService: EarthquakeService;

    beforeAll(() => {
        const mockEarthquakeAdapter = new MockEarthquakeAdapter();

        earthquakeService = new EarthquakeService(mockEarthquakeAdapter);
    });

    describe('getEarthquakes', () => {
        it('should return an array of earthquakes', async () => {
            const result = await earthquakeService.getEarthquakes({minmumMagnitude: 6.5});

            expect(result).toEqual([{
                magnitude: 6.5,
                place: '32 km W of Sola, Vanuatu',
                time: new Date(1388592209000),
                coordinates: [167.249, -13.8633, 187]
            }]);
        });

        it('should call the earthquake adapter with the correct parameters', async () => {
            const mockEarthquakeAdapter = earthquakeService['earthquakeAdapter'] as MockEarthquakeAdapter;
            const params = { minmumMagnitude: 6.5 };

            await earthquakeService.getEarthquakes(params);

            expect(mockEarthquakeAdapter.getEarthquakes).toHaveBeenCalledWith(params);
        });
    });
});
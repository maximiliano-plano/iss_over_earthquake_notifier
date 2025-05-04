const mockAxios = {
    get: jest.fn().mockResolvedValue(Promise.resolve({
        data: require('../../tests/resources/fetch_earthquakes.response.json')
    }))
}
jest.mock('axios', () => ({
    create: jest.fn().mockImplementation(() => mockAxios)
}));

import { UsgsEarthquakeProvider } from "./rest_usgs_earthquake.provider";

describe('RestUsgsEarthquakeProvider', () => {
    let usgsProvider: UsgsEarthquakeProvider;
    
    beforeAll(() => {
        usgsProvider = new UsgsEarthquakeProvider('https://earthquake.usgs.gov/fdsnws/event/1', 1);     
    });

    describe('fetchEarthquakes', () => {
        it('should fetch earthquake data from USGS', async () => {
            const data = await usgsProvider.fetchLastEarthquakes();

            expect(data).toBeDefined();
            expect(data.length).toBe(2);
            expect(data[0].magnitude).toBe(0.72);
            expect(data[0].place).toBe('5 km WNW of Cobb, CA');
            expect(data[0].time).toStrictEqual(new Date(1746308703430));
            expect(data[0].location.coordinates[0]).toBe(-122.783836364746);
            expect(data[0].location.coordinates[1]).toBe(38.8348350524902);
            expect(data[1].magnitude).toBe(1.7);
            expect(data[1].place).toBe('50 km SSW of Cantwell, Alaska');
            expect(data[1].time).toStrictEqual(new Date(1746307648616));
            expect(data[1].location.coordinates[0]).toBe(-149.3607);
            expect(data[1].location.coordinates[1]).toBe(62.9757);
        });

        it('should throw an error when the API throws an error', async () => {
            mockAxios.get = jest.fn().mockRejectedValue(new Error('Network Error'));

            await expect(usgsProvider.fetchLastEarthquakes()).rejects.toThrow('Failed to fetch earthquake data');
        });
    });
});
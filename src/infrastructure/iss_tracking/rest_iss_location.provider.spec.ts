const mockAxios = {
    get: jest.fn().mockResolvedValue(Promise.resolve({
        data: {
            name: "iss",
            id: 25544,
            latitude: -27.846583999739,
            longitude: 23.449887173555,
            altitude: 427.67051448742,
            velocity: 27556.02203504,
            visibility: "eclipsed",
            footprint: 4546.2835213713,
            timestamp: 1746207192,
            daynum: 2460798.2313889,
            solar_lat: 15.608082525129,
            solar_lon: 275.93441580762,
            units: "kilometers"
        }
    }))
}
jest.mock('axios', () => ({
    create: jest.fn().mockImplementation(() => mockAxios)
}));

import { RestIssLocationProvider } from './rest_iss_location.provider';

describe('REST ISS Tracking Provider', () => {
    it('should call the ISS location API and return the current location', async () => {
        const restIssLocationProvider = new RestIssLocationProvider('https://api.wheretheiss.at/v1/satellites/25544');
        const data = await restIssLocationProvider.getCurrentLocation();

        expect(data).toBeDefined();
        expect(data.latitude).toBe(-27.846583999739);
        expect(data.longitude).toBe(23.449887173555);        
    });

    it('should thow an error when ISS location API is not recheable', async () => {
        mockAxios.get = jest.fn().mockRejectedValue(new Error('server error'));

        const restIssLocationProvider = new RestIssLocationProvider('https://invalid-url.com');
        await expect(restIssLocationProvider.getCurrentLocation())
            .rejects.toThrow('Failed to fetch iss location data');
    });
});
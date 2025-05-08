
const mockAxios = {
    get: jest.fn().mockResolvedValue(
        if()
        Promise.resolve({
        data: require('../../tests/resources/fetch_earthquakes.response.json')
    }))
}

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


import run from './run';

describe('Run', () => {
    it('should request ISS location', async () => {
        await run();
    });

    it('should avoid quering earthquakes when ISS location is undefined', async () => {

    });

    it('should add earthquakes to the repository when provider retrieve new ones', async () => {

    });

    it('should send a notification when the iss is over an earthquake', async () => {

    });

    it('should be able to send multiple notificaitons when the iss is over multiple earthquakes', async () => {

    });

    it('should not send notificaitons when iss is not over an earthquake', async () => {
        
    });

    it('should finish without an error when earthquake provider is not available', async () => {

    });

    it('should finish without an error when iss provider is not available ', async () => {

    });

    it('should filter out earthquakes when age is below minimum', async () => {

    });

    it('should filter out earthquakes when age is above maximum', async () => {

    });

    it('should filter out earthquakes when magnitude is below minimum', async () => {

    });

    it('should filter out earthquakes when location is out of radius', async () => {

    });

    it('should filter out earthquakes when notification has already been sent', async () => {

    });

    it('should update earthquake when notification has been sent', async () => {

    });

    it('should not duplicate earthquakes when provider brings the same back', async () => {

    });
});
const mockAxios = {
    get: jest.fn().mockResolvedValue(Promise.resolve({
        data: require('../../../test/resources/fetch_earthquakes.response.json')
    }))
}

jest.mock('axios', () => ({
    create: jest.fn().mockImplementation(() => mockAxios)
}));

import { UsgsEarthquakeProvider } from "../../infrastructure/earthquake/rest_usgs_earthquake.provider";
import { MongoEarthquakeRepository } from "../../infrastructure/earthquake/mongo.earthquake_repository";
import { EarthquakeService } from "./earthquake.service";
import { Collection, connect, connection, AnyObject } from "mongoose";

describe('EarthquakeService', () => {
    let earthquakeService: EarthquakeService;
    let earthquakeCollection: Collection<AnyObject>;
    let mongoEarthquakeRepository: MongoEarthquakeRepository;

    beforeAll(async () => {
        const MockUsgsEarthquakeProvider = new UsgsEarthquakeProvider('https://earthquake.usgs.gov/fdsnws/event/1', 1);
        await connect("mongodb://127.0.0.1:27017/iss_over_earthquakes_db", {
            bufferCommands: false,
            autoCreate: false,
        });

        mongoEarthquakeRepository = new MongoEarthquakeRepository();
        earthquakeCollection = connection.collection("earthquakes");
        await earthquakeCollection.deleteMany();

        earthquakeService = new EarthquakeService(MockUsgsEarthquakeProvider, mongoEarthquakeRepository);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    afterEach(async () => {
        await earthquakeCollection.deleteMany();
    });

    describe('getEarthquakes', () => {
        it('should retrieve earthquakes when are inside of center radius', async () => {
            const earthquakes = [
                {
                    magnitude: 4.5,
                    place: "Los Angeles",
                    time: new Date(),
                    location: {
                        coordinates: [-118.25, 34.05],
                        type: "Point"
                    },
                    external_id: "e1",
                },
                {
                    magnitude: 3.0,
                    place: "Avocado Lake Park",
                    time: new Date(),
                    location: {
                        coordinates: [-119.4179, 36.7783],
                        type: "Point"
                    },
                    external_id: "e2",
                },
            ];

            await earthquakeCollection.insertMany(earthquakes);

            const result = await earthquakeService.getEarthquakes({
                startTime: new Date(Date.now() - 1000),
                endTime: new Date(),
                center: { latitude: 34.0522, longitude: -118.2437 },
                maximumRadiusInKm: 200,
                minmumMagnitude: 2.0,
                limit: 10
            });

            expect(result).toHaveLength(1);
            expect(result[0].place).toBe("Los Angeles");
        });

        it('should filter out earthquakes when are below minimum magnitude', async () => {
            const earthquakes = [
                {
                    magnitude: 1.5,
                    place: "Small Town",
                    time: new Date(),
                    location: {
                        coordinates: [-120.0, 35.0],
                        type: "Point"
                    },
                    external_id: "e3",
                },
                {
                    magnitude: 4.5,
                    place: "Big City",
                    time: new Date(),
                    location: {
                        coordinates: [-118.25, 34.05],
                        type: "Point"
                    },
                    external_id: "e4",
                },
            ];

            await earthquakeCollection.insertMany(earthquakes);

            const result = await earthquakeService.getEarthquakes({
                startTime: new Date(Date.now() - 1000),
                endTime: new Date(),
                center: { latitude: 34.0522, longitude: -118.2437 },
                maximumRadiusInKm: 500,
                minmumMagnitude: 2.0,
                limit: 10
            });

            expect(result).toHaveLength(1);
            expect(result[0].place).toBe("Big City");
        });

        it('should filter out earthquakes when are younger that endtime', async () => {
            const earthquakes = [
                {
                    magnitude: 4.5,
                    place: "Recent Quake",
                    time: new Date("2025-05-05"),
                    location: {
                        coordinates: [-118.25, 34.05],
                        type: "Point"
                    },
                    external_id: "e5",
                },
                {
                    magnitude: 4.5,
                    place: "Old Quake",
                    time: new Date("2025-01-03"),
                    location: {
                        coordinates: [-118.25, 34.05],
                        type: "Point"
                    },
                    external_id: "e6",
                },
            ];

            await earthquakeCollection.insertMany(earthquakes);

            const result = await earthquakeService.getEarthquakes({
                startTime: new Date("2025-01-01"),
                endTime: new Date("2025-04-30"),
                center: { latitude: 34.0522, longitude: -118.2437 },
                maximumRadiusInKm: 500,
                minmumMagnitude: 2.0,
                limit: 10
            });

            expect(result).toHaveLength(1);
            expect(result[0].place).toBe("Old Quake");
        });

        it('should limit the number of earthquakes returned', async () => {
            const earthquakes = [
                {
                    magnitude: 4.5,
                    place: "Quake 1",
                    time: new Date(),
                    location: {
                        coordinates: [-118.25, 34.05],
                        type: "Point"
                    },
                    external_id: "e7",
                },
                {
                    magnitude: 4.5,
                    place: "Quake 2",
                    time: new Date(),
                    location: {
                        coordinates: [-118.25, 34.05],
                        type: "Point"
                    },
                    external_id: "e8",
                },
                {
                    magnitude: 4.5,
                    place: "Quake 3",
                    time: new Date(),
                    location: {
                        coordinates: [-118.25, 34.05],
                        type: "Point"
                    },
                    external_id: "e9",
                },
            ];

            await earthquakeCollection.insertMany(earthquakes);

            const result = await earthquakeService.getEarthquakes({
                startTime: new Date(Date.now() - 1000),
                endTime: new Date(),
                center: { latitude: 34.0522, longitude: -118.2437 },
                maximumRadiusInKm: 500,
                minmumMagnitude: 2.0,
                limit: 2
            });

            expect(result).toHaveLength(2);
        });
    });

    describe('fetchAndInsertEarthquakes', () => {
        it('should fetch earthquakes from provider.', async () => {
            await earthquakeService.fetchAndInsertEarthquakes();

            expect(mockAxios.get).toHaveBeenCalled();
        });

        it('should add earthquakes in the database.', async () => {
            await earthquakeService.fetchAndInsertEarthquakes();

            const earthquakesInDb = await earthquakeCollection.find().toArray();

            expect(earthquakesInDb).not.toHaveLength(0);
            expect(earthquakesInDb[0]).toHaveProperty("magnitude");
            expect(earthquakesInDb[0]).toHaveProperty("place");
            expect(earthquakesInDb[0]).toHaveProperty("time");
            expect(earthquakesInDb[0]).toHaveProperty("location");
            expect(earthquakesInDb[0]).toHaveProperty("external_id");
        });

        it('should not duplicate earthquakes in the database', async () => {
            await earthquakeService.fetchAndInsertEarthquakes();
            await earthquakeService.fetchAndInsertEarthquakes();

            const earthquakesInDb = await earthquakeCollection.find().toArray();

            expect(earthquakesInDb).toHaveLength(2);
        });
    });
});
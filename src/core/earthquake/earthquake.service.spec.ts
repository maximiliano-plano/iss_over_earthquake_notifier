
import { EarthquakeService } from "./earthquake.service";
import { MongoEarthquakeRepository } from "../../infrastructure/mongo.earthquake_repository";
import { UsgsEarthquakeProvider } from "../../infrastructure/usgs.earthquake_provider";
import { connect } from "mongoose";

describe('EarthquakeService', () => {
    let earthquakeService: EarthquakeService;

    beforeAll(async () => {
        const usgsEarthquakeProvider = new UsgsEarthquakeProvider('https://earthquake.usgs.gov/fdsnws/event/1');
        const connection = await connect('mongodb://localhost:27017/iss_over_earthquakes_db', {
            bufferCommands: false,
            autoCreate: false,
        });
        const mongoEarthquakeRepository = new MongoEarthquakeRepository(connection);
        const minimumAge = process.env.MINIMUM_AGE_IN_SEC
            ? parseInt(process.env.MINIMUM_AGE_IN_SEC)
            : 5;

        earthquakeService = new EarthquakeService(usgsEarthquakeProvider, mongoEarthquakeRepository, minimumAge);
    });

    describe('getAndInsertEarthquakes', () => {
        it('should retrieve earthquakes when are inside of center radius', async () => {

        });

        it('should filter out earthquakes when are below minimum magnitude', async () => {

        });

        it('should filter out earthquakes when are earlier than minimum age', async () => {

        });

        it('should add earthquakes in the database', async () => {

        });

        it('should not duplicate earthquakes in the database', async () => {

        });

        it('should limit the number of earthquakes returned', async () => {

        });

        it('should handle errors when fetching earthquake data', async () => {
        });

        it('should handle errors when saving earthquake data', async () => {
        });

    });
});
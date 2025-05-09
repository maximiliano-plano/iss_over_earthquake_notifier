import { Earthquake } from "../../core/earthquake/earthquake.interface";
import { MongoEarthquakeRepository } from "./mongo.earthquake_repository";
import EarthquakeRepository from "../../core/earthquake/earthquake.repository";
import { Collection, connect, connection, AnyObject } from "mongoose";

describe("MongoEarthquakeRepository", () => {
  let earthquakeRepository: EarthquakeRepository;
  let earthquakeCollection: Collection<AnyObject>;

  beforeAll(async () => {
    await connect("mongodb://127.0.0.1:27017/iss_over_earthquakes_db", {
      bufferCommands: false,
      autoCreate: false,
    });

    earthquakeRepository = new MongoEarthquakeRepository();
    earthquakeCollection = connection.collection("earthquakes");
    await earthquakeCollection.deleteMany();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  afterEach(async () => {
    await earthquakeCollection.deleteMany();
  });

  describe("get", () => {
    beforeEach(async () => {
      await earthquakeCollection.insertMany([
        {
          magnitude: 5.0,
          place: "Test Place 1",
          time: new Date("2023-01-01"),
          location: {
            coordinates: [-122.4194, 37.7749],
            type: "Point",
          },
          external_id: "randomid1"
        },
        {
          magnitude: 6.0,
          place: "Test Place 2",
          time: new Date("2023-01-01"),
          location: {
            coordinates: [-122.4194, 37.7749],
            type: "Point",
          },
          external_id: "randomid2"
        },
        {
          magnitude: 7.0,
          place: "Test Place 3",
          time: new Date("2023-01-01"),
          location: {
            coordinates: [-122.4194, 37.7749],
            type: "Point",
          },
          external_id: "randomid3"
        },
      ]);
    });

    it("should retrieve earthquakes near a point", async () => {
      const params = {
        center: { latitude: 37.7749, longitude: -122.4194 },
        maximumRadiusInKm: 1,
        minmumMagnitude: 5.0,
        startTime: new Date("2023-01-01"),
        endTime: new Date("2023-01-02"),
        limit: 10,
      };
      const earthquakes = await earthquakeRepository.get(
        params
      );

      expect(earthquakes).toBeDefined();
      expect(earthquakes.length).toBe(3);
      expect(earthquakes[0].place).toBe("Test Place 1");
      expect(earthquakes[1].place).toBe("Test Place 2");
      expect(earthquakes[2].place).toBe("Test Place 3");
    });

    it("should retrieve earthquakes within the specified radius and magnitude range", async () => {
      const params = {
        center: { latitude: 37.7749, longitude: -122.4194 },
        maximumRadiusInKm: 10,
        minmumMagnitude: 5.5,
        startTime: new Date("2023-01-01"),
        endTime: new Date("2023-01-02"),
        limit: 10,
      };

      const earthquakes = await earthquakeRepository.get(
        params
      );

      expect(earthquakes).toBeDefined();
      expect(earthquakes.length).toBe(2);
      expect(earthquakes[0].place).toBe("Test Place 2");
      expect(earthquakes[1].place).toBe("Test Place 3");
    });

    it("should respect the limit parameter when retrieving earthquakes", async () => {
      const params = {
        center: { latitude: 37.7749, longitude: -122.4194 },
        maximumRadiusInKm: 10,
        minmumMagnitude: 5.0,
        startTime: new Date("2023-01-01"),
        endTime: new Date("2023-01-02"),
        limit: 2,
      };

      const earthquakes = await earthquakeRepository.get(
        params
      );

      expect(earthquakes).toBeDefined();
      expect(earthquakes.length).toBe(2);
      expect(earthquakes[0].place).toBe("Test Place 1");
      expect(earthquakes[1].place).toBe("Test Place 2");
    });

    it("should return an empty array when no earthquakes match the criteria", async () => {
      const params = {
        center: { latitude: 0, longitude: 0 },
        maximumRadiusInKm: 1,
        minmumMagnitude: 8.0,
        startTime: new Date("2023-01-01"),
        endTime: new Date("2023-01-02"),
        limit: 10,
      };

      const earthquakes = await earthquakeRepository.get(
        params
      );

      expect(earthquakes).toBeDefined();
      expect(earthquakes.length).toBe(0);
    });

    it('should filter out earthquakes when are younger that endtime', async () => {
      const params = {
        center: { latitude: 37.7749, longitude: -122.4194 },
        maximumRadiusInKm: 10,
        minmumMagnitude: 5.0,
        startTime: new Date("2023-01-03"),
        endTime: new Date("2023-01-02"),
        limit: 10,
      };

      const earthquakes = await earthquakeRepository.get(params);

      expect(earthquakes).toBeDefined();
      expect(earthquakes.length).toBe(0);
    });

    it("should handle empty results when retrieving earthquakes", async () => {
      const params = {
        center: { latitude: 37.7749, longitude: -122.4194 },
        maximumRadiusInKm: 100,
        minmumMagnitude: 5.0,
        startTime: new Date("2022-01-01"),
        endTime: new Date("2022-01-02"),
        limit: 10,
      };
      const earthquakes = await earthquakeRepository.get(
        params
      );

      expect(earthquakes).toBeDefined();
      expect(earthquakes.length).toBe(0);
    });

    it("should filter out results when earthquakes are out of radius", async () => {
      await earthquakeCollection.insertOne({
        magnitude: 6.0,
        place: "Test Place 4",
        time: new Date("2023-01-01"),
        location: {
          coordinates: [-122.422, 37.761],
          type: "Point",
        },
      });

      const params = {
        center: { latitude: 37.76419008, longitude: -122.4287011 },
        maximumRadiusInKm: 1,
        minmumMagnitude: 5.0,
        startTime: new Date("2023-01-01"),
        endTime: new Date("2023-01-02"),
        limit: 10,
      };
      const earthquakes = await earthquakeRepository.get(
        params
      );

      expect(earthquakes).toBeDefined();
      expect(earthquakes.length).toBe(1);
      expect(earthquakes[0].place).toBe("Test Place 4");
    });
  });

  describe("atomicUpsert", () => {
    it("should add an earthquake", async () => {
      const earthquake: Earthquake = {
        magnitude: 5.0,
        place: "Test Place",
        time: new Date("2023-01-01"),
        location: {
          coordinates: [-122.4194, 37.7749],
          type: "Point",
        },
        external_id: "randomid",
        notification_sent: false
      };

      await earthquakeRepository.atomicUpsert(earthquake);

      const storedEarthquakes = await earthquakeCollection.find({}).toArray();

      expect(storedEarthquakes).toBeDefined();
      expect(storedEarthquakes.length).toBe(1);
    });

    it("should not duplicate an earthquake when adding the same earthquake", async () => {
      const earthquake: Earthquake = {
        magnitude: 5.0,
        place: "Test Place",
        time: new Date("2023-01-01"),
        location: {
          coordinates: [-122.4194, 37.7749],
          type: "Point",
        },
        external_id: "randomid",
        notification_sent: false
      };
      const { _id } = await earthquakeRepository.atomicUpsert(earthquake);
      await earthquakeRepository.atomicUpsert(earthquake, { _id });

      const storedEarthquakes = await earthquakeCollection.find({}).toArray();
      expect(storedEarthquakes).toBeDefined;
      expect(storedEarthquakes.length).toBe(1);
    });
  
    it("should update an earthquake", async () => {
      const earthquake: Earthquake = {
        magnitude: 5.0,
        place: "Test Place 1",
        time: new Date("2023-01-01"),
        location: {
          coordinates: [-122.4194, 37.7749],
          type: "Point",
        },
        external_id: "randomid1",
        notification_sent: false
      };
      const storedEarthquake = await earthquakeRepository.atomicUpsert(earthquake, { external_id: earthquake.external_id });
      expect(storedEarthquake).toBeDefined;
      expect(storedEarthquake.magnitude).toBe(5.0);

      storedEarthquake.magnitude = 5.1;
      await earthquakeRepository.atomicUpsert(earthquake, { external_id: earthquake.external_id });
      expect(storedEarthquake).toBeDefined;
      expect(storedEarthquake.magnitude).toBe(5.1);
    });
  });
});

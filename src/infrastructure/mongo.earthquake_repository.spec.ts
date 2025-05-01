import { earthquakeSchema, MongoEarthquakeRepository } from "./mongo.earthquake_repository";
import { Schema, connect, connection } from "mongoose";

describe("MongoEarthquakeRepository", () => {
  let mongoEarthquakeRepository: MongoEarthquakeRepository;
  let testEarthqueakes: any[] = [];

  beforeAll(async () => {
    await connect("mongodb://127.0.0.1:27017/iss_over_earthquakes_db", {
      bufferCommands: false,
      autoCreate: false,
    });

    mongoEarthquakeRepository = new MongoEarthquakeRepository();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  beforeEach(async () => {
    const earthquakeModel = connection.model("Earthquake", earthquakeSchema);

    const testEarthquake = await earthquakeModel.create([
      {
        magnitude: 5.0,
        place: "Test Place 1",
        time: new Date("2023-01-01"),
        location: { 
            coordinates: [37.7749, -122.4194 ],
            type: "Point",
        }
      },
      {
        magnitude: 6.0,
        place: "Test Place 2",
        time: new Date("2023-01-01"),
        location: { 
            coordinates: [37.7749, -122.4194 ],
            type: "Point",
        }
      },
      {
        magnitude: 7.0,
        place: "Test Place 3",
        time: new Date("2023-01-01"),
        location: { 
            coordinates: [37.7749, -122.4194 ],
            type: "Point",
        }
      },
    ]);
    testEarthqueakes.push(...testEarthquake);
  });

  afterEach(async () => {
    await connection.dropCollection("earthquakes");
  });

  it("should retrieve earthquakes near a point", async () => {
    const params = {
      center: { latitude: 37.7749, longitude: -122.4194 },
      maximumRadius: 100,
      minmumMagnitude: 5.0,
      startTime: new Date("2023-01-01"),
      endTime: new Date("2023-01-02"),
      limit: 10,
    };
    const earthquakes = await mongoEarthquakeRepository.getEarthquakes(params);

    expect(earthquakes).toBeDefined();
    expect(earthquakes.length).toBe(3);
    earthquakes.forEach((earthquake: any, index) => {
      expect(earthquake.magnitude).toBeGreaterThanOrEqual(5.0);
      expect(earthquake.place).toBe(`Test Place ${index + 1}`);
      expect(earthquake.time).toBeInstanceOf(Date);
      expect(earthquake.coordinates.latitude).toBe(37.7749);
      expect(earthquake.coordinates.longitude).toBe(-122.4194);
    });
  });

  it("should handle errors when retrieving earthquakes", async () => {
    const params = {
      center: { latitude: 37.7749, longitude: -122.4194 },
      maximumRadius: 100,
      minmumMagnitude: 5.0,
      startTime: new Date("2023-01-01"),
      endTime: new Date("2023-01-02"),
      limit: 10,
    };
    await expect(
      mongoEarthquakeRepository.getEarthquakes(params)
    ).rejects.toThrow("Failed to fetch earthquake data");
  });

  it("should handle empty results when retrieving earthquakes", async () => {
    const params = {
      center: { latitude: 37.7749, longitude: -122.4194 },
      maximumRadius: 100,
      minmumMagnitude: 5.0,
      startTime: new Date("2022-01-01"),
      endTime: new Date("2022-01-02"),
      limit: 10,
    };
    const earthquakes = await mongoEarthquakeRepository.getEarthquakes(params);

    expect(earthquakes).toBeDefined();
    expect(earthquakes.length).toBe(0);
  });

  it("should filter out results when earthquakes are out of radius", async () => {
    const params = {
      center: { latitude: 37.7649, longitude: -122.4294 },
      maximumRadius: 100,
      minmumMagnitude: 5.0,
      startTime: new Date("2023-01-01"),
      endTime: new Date("2023-01-02"),
      limit: 10,
    };
    const earthquakes = await mongoEarthquakeRepository.getEarthquakes(params);

    expect(earthquakes).toBeDefined();
    expect(earthquakes.length).toBe(0);
  });

  it("should save earthquakes", async () => {
    const newEarthquakes = [
      {
        magnitude: 5.0,
        place: "Test Place 4",
        time: new Date("2023-01-01"),
        location: { 
            coordinates: [37.7749, -122.4194 ],
            type: "Point",
        }
      },
      {
        magnitude: 6.0,
        place: "Test Place 5",
        time: new Date("2023-01-01"),        
        location: { 
            coordinates: [37.7749, -122.4194 ],
            type: "Point",
        },
      },
      {
        magnitude: 7.0,
        place: "Test Place 6",
        time: new Date("2023-01-01"),
        location: { 
            coordinates: [37.7749, -122.4194 ],
            type: "Point",
        }
      },
    ];
    await mongoEarthquakeRepository.saveEarthquakes(newEarthquakes);

    const savedEarthquakes = await connection.model("Earthquake").find({});
    expect(savedEarthquakes.length).toBe(3);
    for (const index in savedEarthquakes) {
      expect(savedEarthquakes[index].magnitude).toBe(
        newEarthquakes[index].magnitude
      );
      expect(savedEarthquakes[index].place).toBe(newEarthquakes[index].place);
      expect(savedEarthquakes[index].time).toEqual(newEarthquakes[index].time);
      expect(savedEarthquakes[index].coordinates.latitude).toBe(
        newEarthquakes[index].location.coordinates[0]
      );
      expect(savedEarthquakes[index].coordinates.longitude).toBe(
        newEarthquakes[index].location.coordinates[1]
      );
    }
    savedEarthquakes.forEach((earthquake: any) => {
      earthquake.deleteOne(); // Clean up after test
    });
  });

  it("should handle errors when saving earthquakes", async () => {
    await expect(mongoEarthquakeRepository.saveEarthquakes([])).rejects.toThrow(
      "Failed to save earthquake data"
    );
  });

  it("should ignore duplicate earthquakes when saving earthquakes", async () => {
    const newEarthquakes = [
      {
        magnitude: 5.0,
        place: "Test Place 1",
        time: new Date("2023-01-01"),
        location: { 
            coordinates: [37.7749, -122.4194 ],
            type: "Point",
        }
      },
      {
        magnitude: 6.0,
        place: "Test Place 2",
        time: new Date("2023-01-01"),
        location: { 
            coordinates: [37.7749, -122.4194 ],
            type: "Point",
        }
      },
      {
        magnitude: 7.0,
        place: "Test Place 3",
        time: new Date("2023-01-01"),
        location: { 
            coordinates: [37.7749, -122.4194 ],
            type: "Point",
        }
      },
    ];
    await mongoEarthquakeRepository.saveEarthquakes(newEarthquakes);

    const savedEarthquakes = await connection.model("Earthquake").find({});
    expect(savedEarthquakes.length).toBe(3);
  });
});

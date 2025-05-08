let getResponses: { url: string; action: Promise<any> }[] = [];

const mockAxios = {
  get: jest
    .fn()
    .mockImplementation(
      (url: string) => getResponses.find((r) => r.url === url)?.action
    ),
};

jest.mock("axios", () => ({
  create: jest.fn().mockImplementation(() => mockAxios),
}));
const fetch_earthquakes_data = require("../../test/resources/fetch_earthquakes.response.json");

import { OverlapTracker } from "./overlap_tracker";
import { EarthquakeService } from "./earthquake/earthquake.service";
import { Collection, connect, connection, AnyObject } from "mongoose";
import EarthquakeProvider from "./earthquake/earthquake.provider";
import EarthquakeRepository from "./earthquake/earthquake.repository";
import { IssTrackingService } from "./iss_tracking/iss_tracking.service";
import { IssLocationProvider } from "./iss_tracking/iss_location.provider";
import { RestIssLocationProvider } from "./../infrastructure/iss_tracking/rest_iss_location.provider";
import { UsgsEarthquakeProvider } from "../infrastructure/earthquake/rest_usgs_earthquake.provider";
import { MongoEarthquakeRepository } from "../infrastructure/earthquake/mongo.earthquake_repository";
import { NotificationService } from "./notification/notification.service";

describe("OverlapTracker", () => {
  let overlapTracker: OverlapTracker;
  let earthquakeCollection: Collection<AnyObject>;
  let earthquakeRepository: EarthquakeRepository;
  let earthquakeProvider: EarthquakeProvider;
  let earthquakeService: EarthquakeService;
  let issLocationProvider: IssLocationProvider;
  let issTrackingService: IssTrackingService;
  let notificationService: NotificationService;

  beforeAll(async () => {
    await connect("mongodb://127.0.0.1:27017/iss_over_earthquakes_db", {
      bufferCommands: false,
      autoCreate: false,
    });

    earthquakeCollection = connection.collection("earthquakes");
    await earthquakeCollection.deleteMany();

    earthquakeProvider = new UsgsEarthquakeProvider(
      "https://earthquake.usgs.gov/fdsnws/event/1",
      1
    );
    earthquakeRepository = new MongoEarthquakeRepository();
    earthquakeService = new EarthquakeService(
      earthquakeProvider,
      earthquakeRepository
    );

    issLocationProvider = new RestIssLocationProvider(
      "https://api.wheretheiss.at/v1/satellites/25544"
    );
    issTrackingService = new IssTrackingService(issLocationProvider, 1, 0);

    notificationService = new NotificationService();

    overlapTracker = new OverlapTracker(
      earthquakeService,
      issTrackingService,
      notificationService
    );
  });

  beforeEach(async () => {
    getResponses = [
      {
        url: "/query",
        action: Promise.resolve({
          data: fetch_earthquakes_data,
        }),
      },
      {
        url: "",
        action: Promise.resolve({
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
            units: "kilometers",
          },
        }),
      },
    ];
  });

  afterAll(async () => {
    await connection.destroy();
  });

  afterEach(async () => {
    await earthquakeCollection.deleteMany();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it("should avoid quering earthquakes when ISS location is undefined", async () => {
    getResponses.unshift({
      url: "",
      action: Promise.reject(new Error("Network Error")),
    });
    const spy = jest.spyOn(earthquakeRepository, "get");

    await overlapTracker.run();

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("should add earthquakes to the repository when provider retrieve new ones", async () => {
    const newEarthquake = {
      id: "test-earthquake-id",
      properties: {
        mag: 5.5,
        place: "Test Location",
        time: Date.now(),
      },
      geometry: {
        type: "Point",
        coordinates: [23.449887173555, -27.846583999739],
      },
    };

    fetch_earthquakes_data.features.push(newEarthquake);

    await overlapTracker.run();

    const storedEarthquakes = await earthquakeCollection
      .find({ place: "Test Location" })
      .toArray();

    expect(storedEarthquakes.length).toBe(1);
    expect(storedEarthquakes[0].magnitude).toBe(
      newEarthquake.properties.mag
    );
    expect(storedEarthquakes[0].place).toBe(
      newEarthquake.properties.place
    );
    expect(storedEarthquakes[0].location.coordinates).toEqual(
      newEarthquake.geometry.coordinates
    );
  });

  it("should finish without an error when earthquake provider is not available", async () => {
    getResponses.unshift({
      url: "/query",
      action: Promise.reject(new Error("Network Error")),
    });

    await expect(overlapTracker.run()).resolves.not.toThrow();
  });

  it.skip("should send a notification when the iss is over an earthquake", async () => {

  });

  it.skip("should be able to send multiple notificaitons when the iss is over multiple earthquakes", async () => {});

  it.skip("should not send notificaitons when iss is not over an earthquake", async () => {});

  it.skip("should update earthquake when notification has been sent", async () => {});
});

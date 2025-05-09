const mockAxios = {
  get: jest.fn().mockImplementation((url: string) => {
    if (url === "https://earthquake.usgs.gov/fdsnws/event/1") {
      return Promise.resolve({
        data: require("../../tests/resources/fetch_earthquakes.response.json"),
      });
    } else {
      return Promise.resolve({
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
      });
    }
  }),
};

jest.mock('axios', () => ({
    create: jest.fn().mockImplementation(() => mockAxios)
}));

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

    earthquakeProvider = new UsgsEarthquakeProvider("https://earthquake.usgs.gov/fdsnws/event/1", 1);
    earthquakeRepository = new MongoEarthquakeRepository();
    earthquakeService = new EarthquakeService(earthquakeProvider, earthquakeRepository);

    issLocationProvider = new RestIssLocationProvider("https://api.wheretheiss.at/v1/satellites/25544");
    issTrackingService = new IssTrackingService(issLocationProvider, 1, 0);

    notificationService = new NotificationService();

    overlapTracker = new OverlapTracker(earthquakeService, issTrackingService, notificationService);
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
    mockAxios.get = jest.fn().mockImplementation((url) => {
        if(url === 'https://api.wheretheiss.at/v1/satellites/25544') {
            throw new Error("Network Error");
        }
    });
    const spy = jest.spyOn(earthquakeRepository, 'get');

    await overlapTracker.run();

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("should add earthquakes to the repository when provider retrieve new ones", async () => {});

  it("should send a notification when the iss is over an earthquake", async () => {});

  it("should be able to send multiple notificaitons when the iss is over multiple earthquakes", async () => {});

  it("should not send notificaitons when iss is not over an earthquake", async () => {});

  it("should finish without an error when earthquake provider is not available", async () => {});

  it("should finish without an error when iss provider is not available ", async () => {});

  it("should filter out earthquakes when age is below minimum", async () => {});

  it("should filter out earthquakes when age is above maximum", async () => {});

  it("should filter out earthquakes when magnitude is below minimum", async () => {});

  it("should filter out earthquakes when location is out of radius", async () => {});

  it("should filter out earthquakes when notification has already been sent", async () => {});

  it("should update earthquake when notification has been sent", async () => {});

  it("should not duplicate earthquakes when provider brings the same back", async () => {});
});

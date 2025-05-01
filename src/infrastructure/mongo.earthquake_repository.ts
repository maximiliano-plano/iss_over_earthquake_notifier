import EarthquakeRepository from "../core/earthquake/earthquake.repository";
import { Earthquake } from "../core/earthquake/earthquake.interface";
import { QueryParams } from "../core/earthquake/earthquake.service";
import { Schema, connection, connect } from "mongoose";

export const earthquakeSchema = new Schema<Earthquake>({
  magnitude: { type: Number, required: true },
  place: { type: String, required: true },
  time: { type: Date, required: true },
  location: {
    coordinates: {
      type: [Number],
      required: true,
      index: "2dsphere",
    },
    type: { type: String, required: true, default: "Point" },
  },
});

export class MongoEarthquakeRepository implements EarthquakeRepository {
  constructor() {}

  async getEarthquakes(params: QueryParams): Promise<Earthquake[]> {
    const earthquakes = await connection.model("earthquakes", earthquakeSchema)
      .where({
        magnitude: { $gte: params.minmumMagnitude },
        time: { $gte: params.startTime, $lte: params.endTime },
      })
      .near('earthquakes.coordinates', {
        center: [params.center.latitude, params.center.longitude],
        maxDistance: params.maximumRadius * 1000, // Convert km to meters
      })
      .limit(params.limit)
      .exec();

    return earthquakes;
  }

  async saveEarthquakes(earthquakes: Earthquake[]): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export default async function MongoEarthquakeRepositoryFactory() {
  const monguURI = process.env.MONGODB_URI;
  if (!monguURI) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
  }

  await connect(monguURI, {
    bufferCommands: false,
    autoCreate: false,
  });
  return new MongoEarthquakeRepository();
}

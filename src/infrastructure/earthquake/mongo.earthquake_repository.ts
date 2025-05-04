import EarthquakeRepository from "../../core/earthquake/earthquake.repository";
import { Earthquake } from "../../core/earthquake/earthquake.interface";
import { QueryParams } from "../../core/earthquake/earthquake.service";
import { Schema, connection, connect } from "mongoose";

export const earthquakeSchema = new Schema<Earthquake>({
  _id: { type: Schema.Types.ObjectId, auto: true },
  magnitude: { type: Number, required: true },
  place: { type: String, required: true },
  time: { type: Date, required: true },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  },
  external_id: { type: String, unique: true }
});
earthquakeSchema.index({ location: '2dsphere' });

export class MongoEarthquakeRepository implements EarthquakeRepository {
  constructor() { }

  async get(params: QueryParams): Promise<Earthquake[]> {
    const earthquakes = await connection.model("earthquakes", earthquakeSchema)
      .find({
        magnitude: { $gte: params.minmumMagnitude },
        time: { $gte: params.startTime, $lte: params.endTime },
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [params.center.longitude, params.center.latitude]
            },
            $maxDistance:  params.maximumRadiusInKm * 1000
          }
        }
      })
      .limit(params.limit)
      .exec();

    return earthquakes;
  }
  
  async atomicUpsert(earthquake: Earthquake, filter: Partial<Earthquake> = {}): Promise<Earthquake> {
    const storedEarthquake = await connection
      .model<Earthquake>('earthquakes', earthquakeSchema)
      .findOneAndUpdate(filter, earthquake, {
        new: true,
        upsert: true
      });
    
    return storedEarthquake;
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
    autoIndex: false
  });
  return new MongoEarthquakeRepository();
}

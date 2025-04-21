import { Earthquake } from "./earthquake.interface"
export interface QueryParams {
    startTime?: Date,
    endTime?: Date,
    minmumMagnitude: number,
}

export default abstract class EarthquakeAdapter {
    abstract getEarthquakes(params: QueryParams): Promise<Earthquake[]>;
}
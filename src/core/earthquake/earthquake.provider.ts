import { Earthquake } from "./earthquake.interface";
import { QueryParams } from "./earthquake.service";

export default abstract class EarthquakeProvider {
    abstract fetchEarthquakes(params: QueryParams): Promise<Earthquake[]>;
}
import { Earthquake } from "./earthquake.interface";

export default abstract class EarthquakeProvider {
    /**
     * It retrieves an array of the last earthquakes registered by the provider
     * 
     * @returns {Earthquake[]} last earthquakes
     */
    abstract fetchLastEarthquakes(): Promise<Earthquake[]>;
}
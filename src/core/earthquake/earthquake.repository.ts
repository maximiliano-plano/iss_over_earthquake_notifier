import { Earthquake } from "./earthquake.interface"
import { QueryParams } from "./earthquake.service"

export default abstract class EarthquakeRepository {
    /**
     * Retrieves earthquakes from the repository based on the provided query parameters.
     * 
     * @param params Query parameters to filter earthquakes.
     */
    abstract getEarthquakes(params: QueryParams): Promise<Earthquake[]>;
    
    /**
     * Saves a list of earthquakes to the repository.
     * 
     * @param earthquakes List of earthquakes to save.
     */
    abstract saveEarthquakes(earthquakes: Earthquake[]): Promise<void>;
}
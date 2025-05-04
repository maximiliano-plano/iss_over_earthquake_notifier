import { Earthquake } from "./earthquake.interface"
import { QueryParams } from "./earthquake.service"

export default abstract class EarthquakeRepository {
    /**
     * Retrieves earthquakes from the repository based on the provided query parameters.
     * 
     * @param params Query parameters to filter earthquakes.
     */
    abstract get(params: QueryParams): Promise<Earthquake[]>;
    
    /**
     * Upserts an earthquake based on filter criteria.
     * 
     * @param earthquake stored earthquake.
     * @param filter matching fields to filter earthquakes out.
     * @returns updated earthquake.
     */
    abstract atomicUpsert(earthquake: Earthquake, filter?: Partial<Earthquake>): Promise<Earthquake>;
}
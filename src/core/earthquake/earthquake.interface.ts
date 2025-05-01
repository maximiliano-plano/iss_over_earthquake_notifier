export interface Earthquake {
    magnitude: number,
    place: string,
    time: Date,
    location: {
        coordinates: number[],
        type: string
    }
}
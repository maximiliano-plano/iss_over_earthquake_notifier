export interface Earthquake {
    _id?: string,
    magnitude: number,
    place: string,
    time: Date,
    location: {
        coordinates: number[],
        type: "Point"
    },
    external_id: string
}
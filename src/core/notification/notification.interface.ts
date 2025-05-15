import { Earthquake } from "../earthquake/earthquake.interface";

export interface Notification {
    status: "pending" | "sent" | undefined,
    message: string
}

export interface OverlapNotification extends Notification {
    earthquake: Earthquake,
    iss_location: Location,
}
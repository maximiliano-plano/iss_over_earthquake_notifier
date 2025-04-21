import {connect, Mongoose, Schema, model} from "mongoose";

export interface Webhook {
    url: string;
    method: string;
}

const webhookSchema = new Schema<Webhook>({
    url: { type: String, required: true },
    method: { type: String, required: true }
});

const Webhook = model<Webhook>('Webhook', webhookSchema)

class NotificationService {
    private readonly MONGODB_URI: string;
    private readonly dbConnection: Mongoose;
 
    constructor(MongoDB_URI: string, dbConnection: Mongoose) {
        this.MONGODB_URI = MongoDB_URI;
        this.dbConnection = dbConnection;
    }

    async storeWebhook(webhook: Webhook): Promise<void> {
        this.dbConnection.connect(this.MONGODB_URI);
        const webhookModel = new Webhook(webhook);
        await webhookModel.save();
        await this.dbConnection.disconnect();
    }
}

export async function notificationService() {
    if (!process.env.MONGODB_URI) {
        throw new Error("MongoDB URI is required");
    }

    return new NotificationService (
        process.env.MONGODB_URI,
        await connect(process.env.MONGODB_URI)
)};

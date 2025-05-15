import { Consumer, Kafka, Producer, ProducerRecord, logLevel } from 'kafkajs';
import NotificationQueueProvider from '../../core/notification/notification_queue.provider';
import { getEnvarOrThrow } from '../../util';

export class KafkaNotificationQueueProvider extends NotificationQueueProvider {
    constructor(private readonly producer: Producer,
        private readonly consumer: Consumer
    ){

    }

    publish(notification: Notification): Promise<boolean> {
        const record: ProducerRecord = new ProducerRecord();
        this.producer.send({
            topic: 'overlap_notifications',            
            messages: [{ value: JSON.stringify(testEvent) }],
        });
    }

    subscribe(): Promise<Notification> {
        throw new Error('Method not implemented.');
    }
}

export default async function KafkaQueueProviderFactory(): Promise<KafkaNotificationQueueProvider> {
    const kafka = new Kafka({
        clientId: getEnvarOrThrow<string>('KAFKA_CLIENT_ID'),
        brokers: getEnvarOrThrow<string>('KAFKA_BROKERS').split(','),
        logLevel: logLevel.ERROR,
    });
    
    const producer = kafka.producer();
    const consumer = kafka.consumer({ groupId: `test-group-1` });
    await producer.connect();
    await consumer.connect();

    return new KafkaNotificationQueueProvider(producer, consumer);
}
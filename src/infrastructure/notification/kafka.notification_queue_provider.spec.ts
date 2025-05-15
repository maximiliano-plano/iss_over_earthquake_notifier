import { Kafka, logLevel } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

describe('KakaQueueProvider', () => {
    describe('publish', () => {
        it('should publish an event into the queue', async () => {
            const kafka = new Kafka({
                clientId: 'test-client',
                brokers: ['localhost:9092'],
                logLevel: logLevel.ERROR,
            });

            const topic = 'overlap_notification';

            const producer = kafka.producer();
            const consumer = kafka.consumer({ groupId: `test-group-${uuidv4()}` });

            await producer.connect();
            await consumer.connect();

            const testEvent = { id: uuidv4(), message: 'Test event' };

            let receivedMessage: any = null;

            await consumer.subscribe({ topic, fromBeginning: true });

            const consumePromise = new Promise<void>((resolve, reject) => {
                consumer.run({
                    eachMessage: async ({ message }) => {
                        const value = message.value?.toString();
                        if (value) {
                            receivedMessage = JSON.parse(value);
                            resolve();
                        }
                    },
                }).catch(reject);
            });

            await producer.send({
                topic,
                messages: [{ value: JSON.stringify(testEvent) }],
            });

            await consumePromise;

            expect(receivedMessage).toEqual(testEvent);

            await producer.disconnect();
            await consumer.disconnect();
        });

        it('should throw an error when publish an event fails', async () => {

        });
    });

    describe('subscribe', () => {

    })
})
const mockAxios = require('./resources/axios.mock.js');
jest.mock('axios', () => mockAxios);
const {main, server} = require('../poc.js');
const WebSocket = require('ws');

describe('Slim run', () => {
    let wss;

    beforeEach(async () => {
        wss = new WebSocket('ws://localhost:8080');
        await new Promise((resolve) => wss.on('open', () => {
            resolve();
        }));    
    });

    it('should be able to send a notification when iss is over an earthquake', async () => {
        const promise = new Promise( (resolve) => wss.onmessage = (event) => {
            expect(event.data).toContain('ISS is over an earthquake at ');
            resolve();
            wss.close();
        });
        main(5, 1, 10); 

        await promise;
    });

    it('should send multiple notifications when iss is over multiple earthquakes', async () => {
        let count = 0;
        const promise = new Promise((resolve) => wss.onmessage = (event) => {
            expect(event.data).toContain('ISS is over an earthquake at ');
            resolve();
            count++;
        });
        main(5, 1, 10); 

        await promise;
        expect(count).toBeGreaterThan(1);
    });

    it('should not send a notification when earthquake has already been notify', async ( ) => {
        let count = 0;
        const promise = new Promise((resolve) => wss.onmessage = (event) => {
            expect(event.data).toContain('ISS is over an earthquake at ');
            resolve();
            count++;
        });
        await main(5, 1, 10);
        await main(5, 1, 10);

        await promise;
        expect(count).toBe(2);
        expect(mockAxios.get).toHaveBeenCalledTimes(6);
    });

    it.skip('should be able to paginate eartquakes when there are more than api limit.', async () => {
        let count = 0;
        const promise = new Promise((resolve) => wss.onmessage = (event) => {
            expect(event.data).toContain('ISS is over an earthquake at ');
            resolve();
            count++;
        });
        await main(5, 1, 10);
        await main(5, 1, 10);

        await promise;
        expect(count).toBe(2);
        expect(mockAxios.get).toHaveBeenCalledTimes(6);
    });

    afterAll(() => {
        server.close();
    });
});
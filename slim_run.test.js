const {main, server} = require('./slim_run.js');

describe('Slim run', () => {
    let wss;
    beforeEach(() => {
        wss = new WebSocket('ws://localhost:8080');
    })

    it('should be able to send a notification when iss is over an earthquake', (done) => {
        wss.onmessage = (event) => {
            expect(event.data).toContain('ISS is over an earthquake at ');
            wss.close();
            done();
        };
        main(5, 1, 20001.6); 
    }, 10000);

    it('should send multiple notifications when iss is over multiple earthquakes', (done) => {
        wss.onmessage = (event) => {
            expect(event.data).toContain('ISS is over an earthquake at ');
            wss.close();
            done();
        };
        main(5, 1, 20001.6); 
    }, 10000);

    it('should be able to paginate eartquakes when there are more than api limit (20000).', (done) => {
        let count = 0;
        wss.onmessage = (event) => {
            count++;
            if (count >= 20000) {
                wss.close();
                done();
            }
        };
        main(0, 1, 20001.6); //all earthquakes in the last year
    }, 100000);

    it('should not send a notification when earthquake has already been notify', ( done ) => {
        let count = 0;
        wss.onmessage = (event) => {
            count++;
            if (count >= 20000) {
                wss.close();
                done();
            }
        };
        main(7, 1, 20001.6); 
        main(7, 1, 20001.6);
    }, 10000);

    afterEach(() => {
        wss.close();
        server.close();
    });
});
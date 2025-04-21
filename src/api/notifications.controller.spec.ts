import request from 'supertest';
import {server} from '../index';

describe('notifications', () => {
    it('should be able to register a webhook', async () => {
        const url = `https://remote_url.test/${Date.now()}`;
        const {body, status} = await request(server)
            .post('/notifications/web_hooks')
            .send({ url, method: 'POST' });

        expect(status).toBe(200);
        expect(body.url).toBe(url);
        expect(body.method).toBe('POST');
    });

    it('should return 400 when payload is missing required values', async () => {
        await request(server)
            .post('/notifications/web_hooks')
            .send({ method: 'POST' })
            .expect(400, { error: 'url and method are required' });
        
        await request(server)
            .post('/notifications/web_hooks')
            .send({ web_hook: 'https://remote_url.test/nouns' })
            .expect(400, { error: 'url and method are required' });
            
        await request(server)
            .post('/notifications/web_hooks')
            .send({ })
            .expect(400, { error: 'url and method are required' });
    });

    afterAll(async () => {
        server.close();
    })
});
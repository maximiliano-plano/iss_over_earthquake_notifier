// Mock implementation of axios.get
const axios = {
    get: jest.fn((url, config) => {
        if (url === 'https://earthquake.usgs.gov/fdsnws/event/1/count') {
            return Promise.resolve({
                data: {
                    count: 2 // Mocked earthquake count
                }
            });
        } else if (url === 'https://earthquake.usgs.gov/fdsnws/event/1/query') {
            return Promise.resolve({
                data: {
                    features: [
                        {
                            id: 'earthquake1',
                            properties: {
                                place: 'Mocked Location 1'
                            }
                        },
                        {
                            id: 'earthquake2',
                            properties: {
                                place: 'Mocked Location 2'
                            }
                        }
                    ]
                }
            });
        } else if (url === 'https://api.wheretheiss.at/v1/satellites/25544') {
            return Promise.resolve({
                data: {
                    latitude: 34.05,
                    longitude: -118.25
                }
            });
        } else {
            return Promise.reject(new Error('Unknown URL'));
        }
    })
};

module.exports = axios;
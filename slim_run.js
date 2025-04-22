const axios = require('axios');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

const broadcast = (message) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

async function* getEarthquakes(age, minmagnitude, issCurrentLocation, radius) { 
    const starttime = new Date();
    starttime.setFullYear(new Date().getFullYear() - age);
    
    const params = {
        format: 'geojson',
        starttime: starttime.toISOString().slice(0, 10),
        minmagnitude,
        latitude: issCurrentLocation.latitude,
        longitude: issCurrentLocation.longitude,
        maxradiuskm: radius
    }

    let count = 0;
    try {
        const res = await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/count', {params});
        count = res.data.count;
    } catch (error) {
        console.log(error);
        return;
    }

    params.limit = 20000;
    params.offset = 1;
    do { 
        try {
            const res = await axios.get('https://earthquake.usgs.gov/fdsnws/event/1/query', {params});
            yield res.data.features;
            params.offset += 20000;
        } catch (error) {
            console.log(error);
            return;
        }
    } while (params.offset < count);
}

const getIssCurrentLocation = async () => {
    const res = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
    return res.data;
}

const notifiedEarthquakes = [];

const main = async (minmagnitude, age, radius) => {
    const issCurrentLocation = await getIssCurrentLocation();
    for await(const earthquakes of getEarthquakes(age, minmagnitude, issCurrentLocation, radius)) {      
        earthquakes
            .filter(e => notifiedEarthquakes.indexOf(e.id) === -1) // filter out already notified earthquakes
            .forEach(e => {                       
                broadcast(`ISS is over an earthquake at ${e.properties.place}`);
                notifiedEarthquakes.push(e);
            });
    }
}

module.exports = { main, server: wss };
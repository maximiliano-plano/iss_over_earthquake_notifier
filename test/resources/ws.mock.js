const WebSocket = jest.requireActual('ws');
const clients = [{
    send: jest.fn(),
    readyState: WebSocket.OPEN
}];
const mockWS = {
    ...WebSocket,
    Server: jest.fn(() => ({
        on: jest.fn(),
        clients,
        close: jest.fn(),
    }))
};

module.exports = { mockWS, clients }; 
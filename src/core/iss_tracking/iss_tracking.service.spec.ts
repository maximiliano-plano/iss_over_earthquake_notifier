import {IssTrackingService} from './iss_tracking.service';
import { Location } from './iss_tracking.service'

const mockIssLocationProvider = {
    getCurrentLocation: jest.fn().mockResolvedValue({
        latitude: -27.846583999739,
        longitude: 23.449887173555,
    })
};

describe('ISS Tracking Service', () => {
    let issTrackingService: IssTrackingService;

    beforeAll(() => {
        issTrackingService = new IssTrackingService(mockIssLocationProvider, 3, 1);
    });
    
    describe('getCurrentLocation', () => {
        it('should return the current location of the ISS', async () => {
            const location: Location | undefined = await issTrackingService.getCurrentLocation();
            
            expect(location).toBeDefined();
            expect(location?.latitude).toBe(-27.846583999739);
            expect(location?.longitude).toBe(23.449887173555);
        });

        it('should retry fetching location on error', async () => {
            mockIssLocationProvider.getCurrentLocation = jest.fn()
                .mockRejectedValueOnce(
                    new Error('Failed to fetch iss location data'))
                .mockResolvedValue({
                    latitude: -27.846583999739,
                    longitude: 23.449887173555
                });
            const location: Location | undefined = await issTrackingService.getCurrentLocation();
            
            expect(location).toBeDefined();
            expect(location?.latitude).toBe(-27.846583999739);
            expect(location?.longitude).toBe(23.449887173555);
        });

        it('should return undefined when all attempts have been estiguish', async () => {
            mockIssLocationProvider.getCurrentLocation = jest.fn()
                .mockRejectedValue(
                    new Error('Failed to fetch iss location data')
                );
            
            const location = await issTrackingService.getCurrentLocation();

            expect(location).not.toBeDefined();            
        });
    });
});
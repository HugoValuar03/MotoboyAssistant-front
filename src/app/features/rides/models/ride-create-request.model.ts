export interface RideCreateRequest {
    platform: string;
    distanceKm: number;
    totalValue: number;
    occurredAt: string;
    notes: string;
    waitingFee: number;
    tip: number;
}
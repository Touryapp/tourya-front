export interface SearchToursDto {
    schedule: {
        id: number;
        scheduleDate: string;
        startTime: string;
        endTime: string;
        maxCapacity: number;
        reservedCapacity: number;
        isUnlimitedCapacity: boolean;
        status: string;
    };
    tour: {
        id: number;
        name: string;
        description: string;
        duration: string;
        rating: number;
    };
    address: {
        city: string;
        state: string;
        country: string;
        address: string;
    };
    gallery: {
        imageUrl: string;
        description: string;
        order: number;
    }[];
    slots: {
        slotId: number;
        startTime: string;
        endTime: string;
        minCapacity: number;
        maxCapacity: number;
        prices: {
            ageType: string;
            minAge: number;
            maxAge: number;
            price: number;
        }[];
    }[];
}

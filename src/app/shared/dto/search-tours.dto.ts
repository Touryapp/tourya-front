export interface SearchToursDto {
    schedules: {
        id: number;
        tourId: number;
        scheduleDate: string;
        startTime: string;
        endTime: string;
        capacity: number;
        reservedCapacity: number;
        isUnlimitedCapacity: boolean;
        status: string;
        config: {
            id: number;
            slots: {
                slotId: number;
                startTime: string;
                endTime: string;
                capacity: number;
                prices: {
                    ageType: string;
                    minAge: number;
                    maxAge: number;
                    price: number;
                }[];
            }[];
        };
    }[];
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
        capacity: number;
        prices: {
            ageType: string;
            minAge: number;
            maxAge: number;
            price: number;
        }[];
    }[];
}

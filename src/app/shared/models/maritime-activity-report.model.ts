export enum MaritimeFlag {
    GREEN = 'GREEN',
    YELLOW = 'YELLOW',
    RED = 'RED'
}

export interface MaritimeActivityReport {
    id?: number;
    countryId: number;
    countryName: string;
    stateId: number;
    stateName: string;
    cityId: number;
    cityName: string;
    businessCategoryId: number;
    subcategoryCode: string;
    flag: MaritimeFlag;
    reportStartDate: string; // YYYY-MM-DD
    reportEndDate: string; // YYYY-MM-DD
    createdDate?: string;
    lastModifiedDate?: string;
}

export interface PaginatedMaritimeReports {
    content: MaritimeActivityReport[];
    pageable: {
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        pageNumber: number;
        pageSize: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

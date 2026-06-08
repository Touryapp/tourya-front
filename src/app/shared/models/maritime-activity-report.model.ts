export enum MaritimeFlag {
    GREEN = 'GREEN',
    YELLOW = 'YELLOW',
    RED = 'RED'
}

export interface MaritimeActivityReport {
    id?: number;
    country: string;
    department?: string;
    city: string;
    category?: string;
    subCategory?: string;
    activity: string;
    flag: MaritimeFlag;
    reportDate: string; // YYYY-MM-DD
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

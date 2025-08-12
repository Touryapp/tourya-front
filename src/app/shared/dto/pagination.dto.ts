export interface PaginationDto<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: SortDto;
        pageable: {
            pageNumber: number;
            pageSize: number;
            sort: SortDto;
            offset: number;
            paged: boolean;
            unpaged: boolean;
        } 
    },
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}

export interface SortDto {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
}
export interface SubCategoryDto {
    code: string;
    name: { [key: string]: string };
}

export interface CategoryDto {
    id: number;
    name: { [key: string]: string };
    subCategories?: SubCategoryDto[];
}
export type Property = {
    id: string | number;
    slug?: string;
    title: string;
    description?: string;
    cover?: string;
    pictures?: string[];
    location?: string;
    price_per_night?: number;
    rating_avg?: number;
    ratings_count?: number;
    equipments?: string[];
    tags?: string[];
    host?: {
        id?: number;
        name?: string;
        picture?: string | null;
    };
    host_name?: string;
    host_picture?: string | null;
};
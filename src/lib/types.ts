import type { ListName } from './constants/listNames';

export interface StockMetadata {
    id: string;
    symbol: string;
    company_name: string;
    sector: string;
    market_cap: number;
    exchange: string;
    currency: string;
    country: string;
    industry?: string;
    parqet_logo_url?: string;
    logo_url?: string;
    isin?: string;
    share_outstanding?: number;
    estimate_currency?: string;
    ipo?: string;
    phone?: string;
    weburl?: string;
}

export interface UserStock {
    id: string;
    user_id: string;
    stock_metadata_id: string;
    list_name: ListName;
    created_at: string;
    updated_at: string;
    metadata: StockMetadata;
    notes?: string;
}

export interface ClothingItem {
    id: string;
    user_id: string;
    name: string;
    category: string;
    image_path: string;
    created_at: string;
    public_url: string | null;
    imageUrl?: string;
}

export interface Outfit {
    id: string;
    user_id: string;
    name: string;
    top_id: string | null;
    bottom_id: string | null;
    dress_id: string | null;
    shoes_id: string | null;
    accessory1_id: string | null;
    accessory2_id: string | null;
    accessory3_id: string | null;
    created_at: string;
}

export interface CompanyInfo {
    id: string;
    stock_item_id: string;
    user_id: string;
    description: string;
    industry: string;
    employees: number;
    founded: string;
    headquarters: string;
    website: string;
    financials: Record<string, unknown>;
    notes: string;
    files: string;
    created_at: string;
    updated_at: string;
}

export interface Answer {
    id: string;
    user_id: string;
    stock_item_id: string;
    list_name: string;
    question_id: string;
    answer: boolean;
    text_answer?: string;
}

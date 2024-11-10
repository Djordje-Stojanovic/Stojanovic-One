export interface BaseWikiContent {
    id: string;
    content: string;
    user_id: string;
    updated_at: string;
}

export interface WikiContent extends BaseWikiContent {
    symbol: string;
    section: string;
}

export interface WikiHistoryEntry extends BaseWikiContent {
    wiki_id: string;
    symbol: string;
    section: string;
}

export interface UserData {
    full_name: string | null;
    username: string | null;
}

export interface WikiHistoryEntryWithUser extends WikiHistoryEntry {
    user: UserData;
}

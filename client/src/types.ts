export interface PlayerStats {
    rating: number;
    date: number;
}

export interface GameRecord {
    win: number;
    loss: number;
    draw: number;
}

export interface GameModeStats {
    last: PlayerStats;
    best: PlayerStats;
    record: GameRecord;
}

export interface PlayerData {
    username: string;
    avatar: string;
    title: string;
    name?: string;
    url?: string;
    followers?: number;
    country?: string;
    joined?: number;
    joined_formatted?: string;
    last_online?: number;
    last_online_formatted?: string;
    league?: string;
    clubs?: { url: string; name: string; icon: string }[];
    stats: {
        chess_rapid?: GameModeStats;
        chess_blitz?: GameModeStats;
        chess_bullet?: GameModeStats;
        [key: string]: any;
    };
    player1?: PlayerData;
    player2?: PlayerData;
    activity?: any;
    openings?: any;
    history?: { date: string; rating: number }[];
    [key: string]: any;
}

export interface ComparisonData {
    player1: PlayerData;
    player2: PlayerData;
    history: { date: string; player1?: number; player2?: number }[];
}

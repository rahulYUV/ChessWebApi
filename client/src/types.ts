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
    dailyActivity?: { date: string; count: number }[];
    openings?: any;
    colorStats?: {
        white: { wins: number; loss: number; draw: number; total: number };
        black: { wins: number; loss: number; draw: number; total: number };
    };
    summary?: { wins: number; loss: number; draw: number; total: number };
    games?: {
        pgn: string;
        url: string;
        white: { username: string; result: string; rating: number };
        black: { username: string; result: string; rating: number };
        date: number;
    }[];
    history?: { date: string; rating: number }[];
    [key: string]: any;
}

export interface ComparisonData {
    player1: PlayerData;
    player2: PlayerData;
    history: { date: string; player1?: number; player2?: number }[];
}

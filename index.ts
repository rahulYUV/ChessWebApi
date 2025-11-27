import express, { Request, Response } from "express";
import cors from "cors";

import ChessWebAPI from "chess-web-api";

const app = express();
const port = process.env.PORT || 3000;

const chessAPI = new ChessWebAPI();

app.use(cors());
app.use(express.json());


const handleError = (res: Response, error: any) => {
    const statusCode = error.statusCode || 500;
    const message = error.body || error.message || "Internal Server Error";
    res.status(statusCode).json({ error: message });
};

const formatTimestamp = (ts: number) => {
    return new Date(ts * 1000).toLocaleString();
};

const processData = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(processData);
    } else if (typeof data === 'object' && data !== null) {
        const newData: any = {};
        for (const key in data) {
            newData[key] = processData(data[key]);
            if (['date', 'joined', 'last_online'].includes(key) && typeof data[key] === 'number') {
                newData[`${key}_formatted`] = formatTimestamp(data[key]);
            }
        }
        return newData;
    }
    return data;
};

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Chess Stats API",
        version: "1.0.0",
        endpoints: {
            player: "/player/:id",
            stats: "/player/:id/stats",
            full: "/player/:id/full",
            clubs: "/player/:id/clubs",
            matches: "/player/:id/matches",
            health: "/health"
        }
    });
});

app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/player/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Player ID is required" });
        }
        const player = await chessAPI.getPlayer(id);
        res.json(processData(player.body));
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/player/:id/stats", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Player ID is required" });
        }
        const [stats, history] = await Promise.all([
            chessAPI.getPlayerStats(id),
            getRatingHistory(id)
        ]);

        const responseData = {
            ...processData(stats.body),
            history
        };
        res.json(responseData);
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/player/:id/full", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Player ID is required" });
        }
        const [player, stats, clubs, history] = await Promise.all([
            chessAPI.getPlayer(id),
            chessAPI.getPlayerStats(id),
            chessAPI.getPlayerClubs(id),
            getRatingHistory(id)
        ]);

        const combined = {
            ...player.body,
            stats: stats.body,
            clubs: clubs.body.clubs,
            history
        };

        res.json(processData(combined));
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/player/:id/clubs", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Player ID is required" });
        }
        const clubs = await chessAPI.getPlayerClubs(id);
        res.json(processData(clubs.body));
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/player/:id/matches", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Player ID is required" });
        }
        const matches = await chessAPI.getPlayerCurrentDailyChess(id);
        res.json(processData(matches.body));
    } catch (error) {
        handleError(res, error);
    }
});

const getRatingHistory = async (username: string) => {
    try {
        const archives = await chessAPI.getPlayerMonthlyArchives(username);
        const monthlyArchives = archives.body.archives;
        if (!monthlyArchives || monthlyArchives.length === 0) return [];

        // Get last 12 months
        const last12 = monthlyArchives.slice(-12);

        const history = await Promise.all(last12.map(async (url: string) => {
            try {
                const res = await fetch(url);
                const data = await res.json();
                const games = data.games || [];
                // Filter for rapid games
                const rapidGames = games.filter((g: any) => g.rules === 'chess' && g.time_class === 'rapid');
                if (rapidGames.length === 0) return null;

                // Get the last game of the month
                const lastGame = rapidGames[rapidGames.length - 1];
                const isWhite = lastGame.white.username.toLowerCase() === username.toLowerCase();
                const rating = isWhite ? lastGame.white.rating : lastGame.black.rating;
                // Normalize date to YYYY-MM-01 for easier comparison
                const dateObj = new Date(lastGame.end_time * 1000);
                const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-01`;

                return { date, rating };
            } catch (e) {
                return null;
            }
        }));

        return history.filter((h: any) => h !== null);
    } catch (e) {
        console.error("Error fetching history for", username, e);
        return [];
    }
};

app.get("/compare/:p1/:p2", async (req: Request, res: Response) => {
    try {
        const { p1, p2 } = req.params;
        if (!p1 || !p2) {
            return res.status(400).json({ error: "Both player IDs are required" });
        }

        const [p1Data, p2Data, p1History, p2History] = await Promise.all([
            Promise.all([chessAPI.getPlayer(p1), chessAPI.getPlayerStats(p1)]),
            Promise.all([chessAPI.getPlayer(p2), chessAPI.getPlayerStats(p2)]),
            getRatingHistory(p1),
            getRatingHistory(p2)
        ]);

        // Merge history
        const historyMap = new Map<string, { date: string, player1?: number, player2?: number }>();

        p1History.forEach((h: any) => {
            if (!historyMap.has(h.date)) historyMap.set(h.date, { date: h.date });
            historyMap.get(h.date)!.player1 = h.rating;
        });

        p2History.forEach((h: any) => {
            if (!historyMap.has(h.date)) historyMap.set(h.date, { date: h.date });
            historyMap.get(h.date)!.player2 = h.rating;
        });

        const mergedHistory = Array.from(historyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        // Forward fill logic
        let lastP1: number | undefined = undefined;
        let lastP2: number | undefined = undefined;

        const filledHistory = mergedHistory.map(entry => {
            if (entry.player1 !== undefined) lastP1 = entry.player1;
            if (entry.player2 !== undefined) lastP2 = entry.player2;

            return {
                date: entry.date,
                player1: entry.player1 !== undefined ? entry.player1 : lastP1,
                player2: entry.player2 !== undefined ? entry.player2 : lastP2
            };
        });

        res.json({
            player1: { ...processData(p1Data[0].body), stats: processData(p1Data[1].body) },
            player2: { ...processData(p2Data[0].body), stats: processData(p2Data[1].body) },
            history: filledHistory
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/player/:id/insights", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "Player ID is required" });

        const archives = await chessAPI.getPlayerMonthlyArchives(id);
        const monthlyArchives = archives.body.archives;

        if (!monthlyArchives || monthlyArchives.length === 0) {
            return res.json({ activity: [], openings: [] });
        }

        const lastMonthUrl = monthlyArchives[monthlyArchives.length - 1];
        const response = await fetch(lastMonthUrl);
        const data = await response.json();
        const games = data.games || [];

        const activityMap = new Array(7).fill(0).map(() => new Array(24).fill(0));

        const openingsCount: Record<string, { wins: number, loss: number, draw: number, total: number, color: 'white' | 'black' }> = {};

        games.forEach((game: any) => {
            const date = new Date(game.end_time * 1000);
            const day = date.getDay();
            const hour = date.getHours();
            activityMap[day][hour]++;

            if (game.pgn) {
                const openingMatch = game.pgn.match(/\[Opening "([^"]+)"\]/);
                if (openingMatch) {
                    const opening = openingMatch[1];
                    const isWhite = game.white.username.toLowerCase() === id.toLowerCase();
                    const result = isWhite ? game.white.result : game.black.result;

                    if (!openingsCount[opening]) {
                        openingsCount[opening] = { wins: 0, loss: 0, draw: 0, total: 0, color: isWhite ? 'white' : 'black' };
                    }

                    openingsCount[opening].total++;
                    if (result === 'win') openingsCount[opening].wins++;
                    else if (['checkmated', 'resigned', 'timeout', 'abandoned'].includes(result)) openingsCount[opening].loss++;
                    else openingsCount[opening].draw++;
                }
            }
        });

        const activity = activityMap.map((hours, day) => ({
            day,
            hours: hours.map((count, hour) => ({ hour, count }))
        }));

        const sortedOpenings = Object.entries(openingsCount)
            .sort(([, a], [, b]) => b.total - a.total)
            .slice(0, 10)
            .map(([name, stats]) => ({ name, ...stats }));

        res.json({ activity, openings: sortedOpenings });

    } catch (error) {
        handleError(res, error);
    }
});

app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
    console.log(`Chess Stats API listening on port ${port}`);
});

export default app;

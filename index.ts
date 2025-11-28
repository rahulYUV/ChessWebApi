import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import NodeCache from "node-cache";

import ChessWebAPI from "chess-web-api";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const chessAPI = new ChessWebAPI();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour , rate limit protection 

// middlewares 
app.use(cors());
app.use(express.json());


const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
    console.warn("MongoDB URI is missing. Comments will not be saved.");
} else {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("MongoDB connection error:", err));
}

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model("Comment", commentSchema);

//  handle caching
const getOrSetCache = async (key: string, fetchFunction: () => Promise<any>) => {
    const cachedData = cache.get(key);
    if (cachedData) {
        console.log(`Cache hit for key: ${key}`);
        return cachedData;
    }
    console.log(`Cache miss for key: ${key}`);
    const data = await fetchFunction();
    cache.set(key, data);
    return data;
};

app.post("/comments", async (req: Request, res: Response) => {
    try {
        const { comment } = req.body;
        if (!comment) {
            return res.status(400).json({ error: "Comment is required" });
        }


        const newComment = new Comment({ text: comment });
        await newComment.save();

        const logEntry = `${new Date().toISOString()}: ${comment}\n`;
        const filePath = path.join(__dirname, "comment.txt");

        fs.appendFile(filePath, logEntry, (err) => {
            if (err) console.error("Error writing to local file:", err);
        });

        res.json({ message: "Comment saved successfully" });
    } catch (error) {
        console.error("Error saving comment:", error);
        res.status(500).json({ error: "Failed to save comment" });
    }
});

const visitorSchema = new mongoose.Schema({
    count: { type: Number, default: 99 }
});
const Visitor = mongoose.model("Visitor", visitorSchema);

app.post("/visit", async (req: Request, res: Response) => {
    try {
        let visitor = await Visitor.findOne();
        if (!visitor) {
            visitor = new Visitor({ count: 0 });
        }
        visitor.count++;
        await visitor.save();
        res.json({ count: visitor.count });
    } catch (error) {
        console.error("Error incrementing visitor count:", error);
        res.status(500).json({ error: "Failed to increment visitor count" });
    }
});

app.get("/visit", async (req: Request, res: Response) => {
    try {
        let visitor = await Visitor.findOne();
        if (!visitor) {
            visitor = new Visitor({ count: 0 });
            await visitor.save();
        }
        res.json({ count: visitor.count });
    } catch (error) {
        console.error("Error getting visitor count:", error);
        res.status(500).json({ error: "Failed to get visitor count" });
    }
});


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

// Cache flush endpoint
app.post("/cache/flush", (req: Request, res: Response) => {
    cache.flushAll();
    res.json({ message: "Cache flushed successfully" });
});

app.get("/player/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "Player ID is required" });
        }

        const data = await getOrSetCache(`player-${id}`, async () => {
            const player = await chessAPI.getPlayer(id);
            return processData(player.body);
        });

        res.json(data);
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

        const data = await getOrSetCache(`stats-${id}`, async () => {
            const [stats, history] = await Promise.all([
                chessAPI.getPlayerStats(id),
                getRatingHistory(id)
            ]);

            return {
                ...processData(stats.body),
                history
            };
        });

        res.json(data);
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

        const data = await getOrSetCache(`full-${id}`, async () => {
            const player = await chessAPI.getPlayer(id);
            const stats = await chessAPI.getPlayerStats(id);

            let clubs = { body: { clubs: [] } };
            try {
                clubs = await chessAPI.getPlayerClubs(id);
            } catch (e) {
                console.warn(`Failed to fetch clubs for ${id}`, e);
            }

            const history = await getRatingHistory(id);

            return processData({
                ...player.body,
                stats: stats.body,
                clubs: clubs.body.clubs,
                history
            });
        });

        res.json(data);
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

        const data = await getOrSetCache(`clubs-${id}`, async () => {
            const clubs = await chessAPI.getPlayerClubs(id);
            return processData(clubs.body);
        });

        res.json(data);
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

        const data = await getOrSetCache(`matches-${id}`, async () => {
            const matches = await chessAPI.getPlayerCurrentDailyChess(id);
            return processData(matches.body);
        });

        res.json(data);
    } catch (error) {
        handleError(res, error);
    }
});

const getRatingHistory = async (username: string) => {
    try {
        const archives = await chessAPI.getPlayerMonthlyArchives(username);
        const monthlyArchives = archives.body.archives;
        if (!monthlyArchives || monthlyArchives.length === 0) return [];


        const last12 = monthlyArchives.slice(-12);

        const history = await Promise.all(last12.map(async (url: string) => {
            try {
                const res = await fetch(url);
                const data = await res.json();
                const games = data.games || [];

                const rapidGames = games.filter((g: any) => g.rules === 'chess' && g.time_class === 'rapid');
                if (rapidGames.length === 0) return null;


                const lastGame = rapidGames[rapidGames.length - 1];
                const isWhite = lastGame.white.username.toLowerCase() === username.toLowerCase();
                const rating = isWhite ? lastGame.white.rating : lastGame.black.rating;

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

        const data = await getOrSetCache(`compare-${p1}-${p2}`, async () => {
            const p1Profile = await chessAPI.getPlayer(p1);
            const p1Stats = await chessAPI.getPlayerStats(p1);
            const p1History = await getRatingHistory(p1);

            const p2Profile = await chessAPI.getPlayer(p2);
            const p2Stats = await chessAPI.getPlayerStats(p2);
            const p2History = await getRatingHistory(p2);

            const p1Data = [p1Profile, p1Stats];
            const p2Data = [p2Profile, p2Stats];


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

            return {
                player1: { ...processData(p1Data[0].body), stats: processData(p1Data[1].body) },
                player2: { ...processData(p2Data[0].body), stats: processData(p2Data[1].body) },
                history: filledHistory
            };
        });

        res.json(data);
    } catch (error) {
        handleError(res, error);
    }
});

app.get("/player/:id/insights", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "Player ID is required" });

        const data = await getOrSetCache(`insights-${id}`, async () => {
            const archives = await chessAPI.getPlayerMonthlyArchives(id);
            const monthlyArchives = archives.body.archives;

            if (!monthlyArchives || monthlyArchives.length === 0) {
                return { activity: [], openings: [], dailyActivity: [] };
            }


            const last12Months = monthlyArchives.slice(-12);


            const gamesResults = await Promise.all(
                last12Months.map((url: string) =>
                    fetch(url)
                        .then(res => res.json())
                        .catch(err => {
                            console.error(`Error fetching archive ${url}:`, err);
                            return { games: [] };
                        })
                )
            );

            const allGames = gamesResults.flatMap((data: any) => data.games || []);


            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const lastMonthGames = allGames.filter((game: any) => new Date(game.end_time * 1000) >= thirtyDaysAgo);


            const dailyActivity: Record<string, number> = {};
            allGames.forEach((game: any) => {
                const dateObj = new Date(game.end_time * 1000);
                const dateStr = dateObj.toISOString().split('T')[0];
                dailyActivity[dateStr] = (dailyActivity[dateStr] || 0) + 1;
            });


            const activityMap = new Array(7).fill(0).map(() => new Array(24).fill(0));


            const openingsCount: Record<string, { wins: number, loss: number, draw: number, total: number, color: 'white' | 'black' }> = {};
            const colorStats = {
                white: { wins: 0, loss: 0, draw: 0, total: 0 },
                black: { wins: 0, loss: 0, draw: 0, total: 0 }
            };
            const summary = { wins: 0, loss: 0, draw: 0, total: 0 };

            lastMonthGames.forEach((game: any) => {
                const dateObj = new Date(game.end_time * 1000);
                const day = dateObj.getDay();
                const hour = dateObj.getHours();


                activityMap[day][hour]++;

                const isWhite = game.white.username.toLowerCase() === id.toLowerCase();
                const result = isWhite ? game.white.result : game.black.result;


                summary.total++;
                if (result === 'win') summary.wins++;
                else if (['checkmated', 'resigned', 'timeout', 'abandoned'].includes(result)) summary.loss++;
                else summary.draw++;


                if (isWhite) {
                    colorStats.white.total++;
                    if (result === 'win') colorStats.white.wins++;
                    else if (['checkmated', 'resigned', 'timeout', 'abandoned'].includes(result)) colorStats.white.loss++;
                    else colorStats.white.draw++;
                } else {
                    colorStats.black.total++;
                    if (result === 'win') colorStats.black.wins++;
                    else if (['checkmated', 'resigned', 'timeout', 'abandoned'].includes(result)) colorStats.black.loss++;
                    else colorStats.black.draw++;
                }


                if (game.pgn) {
                    const openingMatch = game.pgn.match(/\[Opening "([^"]+)"\]/);
                    if (openingMatch) {
                        const opening = openingMatch[1];

                        const baseOpening = opening.split(':')[0].split(',')[0];

                        if (!openingsCount[baseOpening]) {
                            openingsCount[baseOpening] = { wins: 0, loss: 0, draw: 0, total: 0, color: isWhite ? 'white' : 'black' };
                        }

                        openingsCount[baseOpening].total++;
                        if (result === 'win') openingsCount[baseOpening].wins++;
                        else if (['checkmated', 'resigned', 'timeout', 'abandoned'].includes(result)) openingsCount[baseOpening].loss++;
                        else openingsCount[baseOpening].draw++;
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

            const dailyActivityArray = Object.entries(dailyActivity).map(([date, count]) => ({ date, count }));

            const gamesForExplorer = lastMonthGames.map((g: any) => ({
                pgn: g.pgn,
                url: g.url,
                white: { username: g.white.username, result: g.white.result, rating: g.white.rating },
                black: { username: g.black.username, result: g.black.result, rating: g.black.rating },
                date: g.end_time
            }));

            return {
                username: id,
                activity,
                openings: sortedOpenings,
                dailyActivity: dailyActivityArray,
                colorStats,
                summary,
                totalGames: allGames.length,
                games: gamesForExplorer
            };
        });

        res.json(data);

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

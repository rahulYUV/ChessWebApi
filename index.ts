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
        const stats = await chessAPI.getPlayerStats(id);
        res.json(processData(stats.body));
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
        const [player, stats, clubs] = await Promise.all([
            chessAPI.getPlayer(id),
            chessAPI.getPlayerStats(id),
            chessAPI.getPlayerClubs(id)
        ]);

        const combined = {
            ...player.body,
            stats: stats.body,
            clubs: clubs.body.clubs
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

app.use((req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
    console.log(`Chess Stats API listening on port ${port}`);
});

export default app;

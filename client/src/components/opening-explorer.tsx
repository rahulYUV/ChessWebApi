import { useState, useMemo, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RotateCcw, ExternalLink } from 'lucide-react';

interface OpeningExplorerProps {
    games: any[];
    username: string;
}

export default function OpeningExplorer({ games, username }: OpeningExplorerProps) {
    const [game, setGame] = useState(new Chess());
    const [currentFen, setCurrentFen] = useState(game.fen());
    const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
    const [evaluation, setEvaluation] = useState<{ eval: string, bestMove: string, continuation?: string } | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    // Parse games once
    const parsedGames = useMemo(() => {
        if (!games || !username) return [];
        return games.map(g => {
            try {
                const tempGame = new Chess();
                tempGame.loadPgn(g.pgn);
                // Determine result for the user
                const isWhite = g.white.username.toLowerCase() === username.toLowerCase();
                const result = isWhite ? g.white.result : g.black.result;
                let outcome = 'draw';
                if (result === 'win') outcome = 'win';
                else if (['checkmated', 'resigned', 'timeout', 'abandoned'].includes(result)) outcome = 'loss';

                return {
                    ...g,
                    moves: tempGame.history(),
                    outcome,
                    isWhite
                };
            } catch (e) {
                return null;
            }
        }).filter((g): g is any => g !== null);
    }, [games, username]);

    // Calculate moves stats based on current position
    const { moveStats, matchingGames } = useMemo(() => {
        const currentHistory = game.history();
        const moveCounts: Record<string, { wins: number, loss: number, draw: number, total: number }> = {};
        const matches: any[] = [];

        parsedGames.forEach(pg => {
            // Check if game matches current history
            if (pg.moves.length < currentHistory.length) return;

            // Check if history matches so far
            let isMatch = true;
            for (let i = 0; i < currentHistory.length; i++) {
                if (pg.moves[i] !== currentHistory[i]) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) {
                matches.push(pg);

                // Only count next move if available
                if (pg.moves.length > currentHistory.length) {
                    const nextMove = pg.moves[currentHistory.length];
                    if (!moveCounts[nextMove]) {
                        moveCounts[nextMove] = { wins: 0, loss: 0, draw: 0, total: 0 };
                    }
                    moveCounts[nextMove].total++;
                    if (pg.outcome === 'win') moveCounts[nextMove].wins++;
                    else if (pg.outcome === 'loss') moveCounts[nextMove].loss++;
                    else moveCounts[nextMove].draw++;
                }
            }
        });

        const stats = Object.entries(moveCounts)
            .sort(([, a], [, b]) => b.total - a.total)
            .map(([move, stats]) => ({ move, ...stats }));

        return { moveStats: stats, matchingGames: matches };
    }, [parsedGames, currentFen, game]);

    // Reset evaluation when position changes
    useEffect(() => {
        setEvaluation(null);
    }, [currentFen]);

    const analyzePosition = async () => {
        setAnalyzing(true);
        try {
            const res = await fetch('https://chess-api.com/v1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fen: currentFen })
            });
            const data = await res.json();
            setEvaluation({
                eval: data.eval > 0 ? `+${data.eval / 100}` : `${data.eval / 100}`,
                bestMove: data.move,
                continuation: data.continuationArr?.join(' ')
            });
        } catch (e) {
            console.error("Analysis failed", e);
        } finally {
            setAnalyzing(false);
        }
    };

    function onDrop(sourceSquare: string, targetSquare: string) {
        try {
            const gameCopy = new Chess();
            gameCopy.loadPgn(game.pgn());
            const move = gameCopy.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            });

            if (move === null) return false;

            setGame(gameCopy);
            setCurrentFen(gameCopy.fen());
            return true;
        } catch (e) {
            return false;
        }
    }

    function makeMove(moveSan: string) {
        try {
            const gameCopy = new Chess();
            gameCopy.loadPgn(game.pgn());
            gameCopy.move(moveSan);
            setGame(gameCopy);
            setCurrentFen(gameCopy.fen());
        } catch (e) {
            console.error("Invalid move:", moveSan);
        }
    }

    function reset() {
        const newGame = new Chess();
        setGame(newGame);
        setCurrentFen(newGame.fen());
    }

    function undo() {
        const gameCopy = new Chess();
        gameCopy.loadPgn(game.pgn());
        gameCopy.undo();
        setGame(gameCopy);
        setCurrentFen(gameCopy.fen());
    }

    function flipBoard() {
        setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Board Section */}
            <Card className="lg:col-span-5 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-sm border-none shadow-none">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center justify-between">
                        <span>Opening Explorer</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={flipBoard} className="h-8">
                                Flip
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={analyzePosition}
                                disabled={analyzing}
                                className={`h-8 ${evaluation ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : ""}`}
                            >
                                {analyzing ? "Thinking..." : evaluation ? `Eval: ${evaluation.eval}` : "Analyze"}
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full max-w-[400px] mx-auto">
                        <Chessboard
                            // @ts-ignore
                            position={currentFen}
                            onPieceDrop={onDrop}
                            boardOrientation={boardOrientation}
                            customDarkSquareStyle={{ backgroundColor: '#779954' }}
                            customLightSquareStyle={{ backgroundColor: '#e9edcc' }}
                        />
                        <div className="flex justify-center gap-4 mt-6">
                            <Button variant="outline" size="sm" onClick={undo} disabled={game.history().length === 0}>
                                <ChevronLeft className="w-4 h-4 mr-1" /> Back
                            </Button>
                            <Button variant="outline" size="sm" onClick={reset} disabled={game.history().length === 0}>
                                <RotateCcw className="w-4 h-4 mr-1" /> Reset
                            </Button>
                        </div>
                        {evaluation && (
                            <div className="mt-6 p-4 bg-background/50 rounded-xl border shadow-sm space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-muted-foreground">Evaluation</span>
                                    <span className={`font-mono font-bold text-lg ${evaluation.eval.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                        {evaluation.eval}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Best Move</span>
                                    <div className="font-mono text-sm bg-muted/50 p-2 rounded-md break-all">
                                        {evaluation.bestMove}
                                    </div>
                                </div>
                                {evaluation.continuation && (
                                    <div className="space-y-1 pt-2 border-t">
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Line</span>
                                        <div className="text-xs text-muted-foreground font-mono leading-relaxed bg-muted/30 p-2 rounded-md">
                                            {evaluation.continuation}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Stats Section */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Candidate Moves */}
                <Card className="flex flex-col overflow-hidden">
                    <CardHeader className="py-4 px-6 bg-muted/20 border-b">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Candidate Moves
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-y-auto max-h-[400px]">
                            <Table>
                                <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                                    <TableRow className="hover:bg-transparent border-b border-border">
                                        <TableHead className="w-[70px] px-2">Move</TableHead>
                                        <TableHead className="text-center px-2">Games</TableHead>
                                        <TableHead className="text-center px-2">Win %</TableHead>
                                        <TableHead className="text-right px-2 pr-4">W / L / D</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {moveStats.map((stat) => (
                                        <TableRow
                                            key={stat.move}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => makeMove(stat.move)}
                                        >
                                            <TableCell className="font-bold font-mono text-primary px-2">{stat.move}</TableCell>
                                            <TableCell className="text-center font-medium px-2">{stat.total}</TableCell>
                                            <TableCell className="text-center px-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    {Math.round((stat.wins / stat.total) * 100)}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right px-2 pr-4 text-xs font-mono text-muted-foreground">
                                                <span className="text-green-600 font-bold">{stat.wins}</span>
                                                <span className="mx-1">/</span>
                                                <span className="text-red-600 font-bold">{stat.loss}</span>
                                                <span className="mx-1">/</span>
                                                <span>{stat.draw}</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {moveStats.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                                                No moves found in database
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Matching Games */}
                <Card className="flex flex-col overflow-hidden">
                    <CardHeader className="py-4 px-6 bg-muted/20 border-b">
                        <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            <span>Matching Games</span>
                            <span className="text-xs bg-background px-2 py-0.5 rounded-full border">
                                {matchingGames.length}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-y-auto max-h-[400px]">
                            <div className="divide-y">
                                {matchingGames.map((g, i) => (
                                    <div key={i} className="p-4 hover:bg-muted/30 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-medium text-sm">
                                                <span className={g.isWhite ? "text-primary font-bold" : ""}>{g.white.username}</span>
                                                <span className="text-muted-foreground mx-1.5 text-xs">vs</span>
                                                <span className={!g.isWhite ? "text-primary font-bold" : ""}>{g.black.username}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${g.outcome === 'win' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                g.outcome === 'loss' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                                }`}>
                                                {g.outcome}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span>{new Date(g.date * 1000).toLocaleDateString()}</span>
                                                <span>•</span>
                                                <span>{g.white.rating} vs {g.black.rating}</span>
                                            </div>
                                            {g.url && (
                                                <a
                                                    href={g.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-primary opacity-0 group-hover:opacity-100 transition-all hover:underline flex items-center gap-1"
                                                >
                                                    View <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {matchingGames.length === 0 && (
                                    <div className="text-center text-muted-foreground py-12 flex flex-col items-center gap-2">
                                        <span>No matching games found</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

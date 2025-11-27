import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button as MovingButton } from "@/components/ui/moving-border"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import FloatingDockDemo from "@/components/floating-dock-demo"
import StatsGrid from "@/components/stats-grid"
import ComparisonView from "@/components/comparison-view"
import InsightsView from "@/components/insights-view"
import { GridBackground } from "@/components/ui/grid-background"
import { motion, AnimatePresence } from "motion/react"
import { Search, ChevronDown, ChevronUp, User, Activity, Swords, Lightbulb } from "lucide-react"
import type { PlayerData, ComparisonData } from "@/types"
import AvatarGroupPopularityIndicatorDemo from "@/components/shadcn-studio/avatar/avatar-21"
import ChartAreaInteractive from "@/components/chart-area-interactive"

function App() {
  const [username, setUsername] = useState("")
  const [username2, setUsername2] = useState("")
  const [mode, setMode] = useState("profile")
  const [data, setData] = useState<PlayerData | ComparisonData | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showJson, setShowJson] = useState(false)

  useEffect(() => {
    setData(null);
    setError("");
  }, [mode]);

  const fetchData = async (usernameOverride?: string) => {
    setError("")
    setData(null)
    const userToFetch = usernameOverride || username;

    if (!userToFetch.trim()) {
      setError("Please enter a username")
      return
    }

    if (mode === 'compare' && !username2.trim()) {
      setError("Please enter a second username for comparison")
      return
    }

    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      let endpoint = '';

      switch (mode) {
        case 'stats':
          endpoint = `${apiUrl}/player/${userToFetch.trim()}/stats`;
          break;
        case 'compare':
          endpoint = `${apiUrl}/compare/${userToFetch.trim()}/${username2.trim()}`;
          break;
        case 'insights':
          endpoint = `${apiUrl}/player/${userToFetch.trim()}/insights`;
          break;
        default:
          endpoint = `${apiUrl}/player/${userToFetch.trim()}/full`;
      }

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }
      const result = await response.json()
      setData(result)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchData()
    }
  }

  const handlePlayerSelect = (selectedUsername: string) => {
    setUsername(selectedUsername);
    if (mode === 'compare') {
      setMode('profile');
    }
    setMode('profile');
    setTimeout(() => fetchData(selectedUsername), 0);
  };

  return (
    <GridBackground>
      <div className="min-h-screen flex flex-col items-center pt-12 md:pt-24 p-4 space-y-8 text-foreground relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 to-neutral-500 dark:from-neutral-200 dark:to-neutral-500">
            Chess Stats
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Analyze player performance with style
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col md:flex-row w-full max-w-3xl items-center gap-3 bg-white/50 dark:bg-black/50 backdrop-blur-md p-2 rounded-2xl border border-black/5 dark:border-white/10 shadow-lg"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Username 1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 h-12 bg-transparent border-transparent focus-visible:ring-0 text-base"
            />
          </div>

          {mode === 'compare' && (
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Username 2"
                value={username2}
                onChange={(e) => setUsername2(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 bg-transparent border-transparent focus-visible:ring-0 text-base"
              />
            </div>
          )}

          <div className="h-8 w-[1px] bg-border hidden md:block" />

          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="h-12 w-full md:w-[200px] border-transparent bg-transparent focus:ring-0 text-base">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profile">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Profile
                </div>
              </SelectItem>
              <SelectItem value="stats">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Stats
                </div>
              </SelectItem>
              <SelectItem value="compare">
                <div className="flex items-center gap-2">
                  <Swords className="h-4 w-4" /> Compare
                </div>
              </SelectItem>
              <SelectItem value="insights">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Insights
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <MovingButton
            borderRadius="0.75rem"
            onClick={() => fetchData()}
            disabled={loading}
            className="bg-black dark:bg-white text-white dark:text-black border-neutral-200 dark:border-slate-800 font-semibold"
            containerClassName="h-12 w-full md:w-40"
          >
            {loading ? "Loading..." : "Analyze"}
          </MovingButton>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm font-medium bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {data && (
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-6xl space-y-8 pb-8"
            >
              {mode === 'compare' && (data as ComparisonData).player1 && (data as ComparisonData).player2 ? (
                <ComparisonView
                  p1Data={(data as ComparisonData).player1}
                  p2Data={(data as ComparisonData).player2}
                  history={(data as ComparisonData).history}
                />
              ) : mode === 'insights' ? (
                <InsightsView data={data as any} />
              ) : mode === 'profile' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl p-6 border border-black/5 dark:border-white/10 shadow-xl flex flex-col items-center text-center space-y-4 h-full">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-lg opacity-50"></div>
                        <img
                          src={(data as PlayerData).avatar || `https://ui-avatars.com/api/?name=${(data as PlayerData).username}`}
                          alt={(data as PlayerData).username}
                          className="relative w-32 h-32 rounded-full border-4 border-white dark:border-neutral-800 shadow-lg object-cover"
                        />
                        {(data as PlayerData).league && (
                          <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full border-2 border-white dark:border-neutral-800">
                            {(data as PlayerData).league}
                          </div>
                        )}
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold">{(data as PlayerData).name || (data as PlayerData).username}</h2>
                        <a
                          href={(data as PlayerData).url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          @{(data as PlayerData).username}
                        </a>
                      </div>

                      <div className="grid grid-cols-2 gap-3 w-full pt-4">
                        <div className="bg-neutral-100 dark:bg-neutral-800/50 p-3 rounded-xl">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Followers</p>
                          <p className="text-lg font-bold">{(data as PlayerData).followers}</p>
                        </div>
                        <div className="bg-neutral-100 dark:bg-neutral-800/50 p-3 rounded-xl">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Country</p>
                          <p className="text-lg font-bold truncate">{(data as PlayerData).country?.split('/').pop() || 'Unknown'}</p>
                        </div>
                        <div className="bg-neutral-100 dark:bg-neutral-800/50 p-3 rounded-xl">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Joined</p>
                          <p className="text-sm font-medium">{(data as PlayerData).joined_formatted || new Date(((data as PlayerData).joined || 0) * 1000).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-neutral-100 dark:bg-neutral-800/50 p-3 rounded-xl">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Last Active</p>
                          <p className="text-sm font-medium">{(data as PlayerData).last_online_formatted || new Date(((data as PlayerData).last_online || 0) * 1000).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {(data as PlayerData).clubs && (data as PlayerData).clubs!.length > 0 && (
                        <div className="w-full pt-6 border-t border-neutral-200 dark:border-neutral-800 mt-4">
                          <h3 className="text-sm font-semibold mb-3 text-left">Clubs ({(data as PlayerData).clubs!.length})</h3>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {(data as PlayerData).clubs!.slice(0, 8).map((club: { url: string; name: string; icon: string }) => (
                              <a
                                key={club.url}
                                href={club.url}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative"
                                title={club.name}
                              >
                                <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1.5 border border-transparent group-hover:border-primary transition-all hover:scale-105 shadow-sm">
                                  <img
                                    src={club.icon}
                                    alt={club.name}
                                    className="w-full h-full object-contain rounded-lg"
                                  />
                                </div>
                              </a>
                            ))}
                            {(data as PlayerData).clubs!.length > 8 && (
                              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-muted-foreground border border-transparent">
                                +{(data as PlayerData).clubs!.length - 8}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6">
                    <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-3xl p-1 border border-black/5 dark:border-white/5">
                      <StatsGrid data={(data as PlayerData).stats || (data as PlayerData)} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold">Detailed Statistics</h2>
                    <div className="text-sm text-muted-foreground">
                      Data for <span className="font-semibold text-primary">@{(data as PlayerData).username}</span>
                    </div>
                  </div>
                  <StatsGrid data={(data as PlayerData)} />
                  {(data as PlayerData).history && (data as PlayerData).history!.length > 0 && (
                    <ChartAreaInteractive
                      data={(data as PlayerData).history!.map(h => ({ date: h.date, player1: h.rating }))}
                      p1Name={(data as PlayerData).username}
                    />
                  )}
                </div>
              )}

              <div className="w-full flex justify-center">
                <button
                  onClick={() => setShowJson(!showJson)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {showJson ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showJson ? "Hide Raw Data" : "Show Raw Data"}
                </button>
              </div>

              <AnimatePresence>
                {showJson && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <pre className="bg-neutral-950 text-neutral-50 p-6 rounded-2xl overflow-auto max-h-[500px] text-xs font-mono border border-neutral-800 shadow-inner">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto w-full py-6 flex justify-center z-50">
          <FloatingDockDemo onPlayerSelect={handlePlayerSelect} />
        </div>

        <div className="fixed bottom-4 left-4 z-50 hidden md:block">
          <AvatarGroupPopularityIndicatorDemo />
        </div>
      </div>
    </GridBackground >
  )
}

export default App

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button as MovingButton } from "@/components/ui/moving-border"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import FloatingDockDemo from "@/components/floating-dock-demo"
import StatsGrid from "@/components/stats-grid"

import { GridBackground } from "@/components/ui/grid-background"

function App() {
  const [username, setUsername] = useState("")
  const [mode, setMode] = useState("profile")
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  const fetchData = async () => {
    setError("")
    setData(null)
    if (!username) return

    try {
      const endpoint = mode === "stats"
        ? `http://localhost:3000/player/${username}/stats`
        : `http://localhost:3000/player/${username}`

      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }
      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <GridBackground>
      <div className="min-h-screen flex flex-col items-center pt-32 p-4 space-y-8 text-foreground relative">
        <h1 className="text-4xl font-bold">Chess Stats Viewer</h1>

        <div className="flex w-full max-w-3xl items-center space-x-4">
          <Input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-16 text-xl px-6"
          />

          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="h-16 w-[200px] text-xl px-6">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="profile" className="text-xl py-3">Profile</SelectItem>
              <SelectItem value="stats" className="text-xl py-3">Stats</SelectItem>
            </SelectContent>
          </Select>

          <MovingButton
            borderRadius="0.5rem"
            onClick={fetchData}
            className="bg-black text-white border-slate-800 text-xl font-semibold"
            containerClassName="h-16 w-40"
          >
            Search
          </MovingButton>
        </div>

        {error && <div className="text-red-500">{error}</div>}

        {data && (
          <div className="w-full max-w-4xl bg-card text-card-foreground rounded-lg border shadow-sm p-6 space-y-4">
            {mode === 'profile' ? (
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={data.avatar || `https://ui-avatars.com/api/?name=${data.username}`}
                  alt={data.username}
                  className="w-32 h-32 rounded-full border-4 border-primary"
                />
                <h2 className="text-2xl font-bold">{data.name || data.username}</h2>
                <div className="grid grid-cols-2 gap-4 w-full text-center">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Followers</p>
                    <p className="text-xl font-bold">{data.followers}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="text-xl font-bold">{data.country?.split('/').pop() || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-center">Statistics</h2>
                <StatsGrid data={data} />

                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Full Response</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm border border-border">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {mode === 'profile' && (
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm mt-4">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        )}

        <div className="mt-auto w-full">
          <FloatingDockDemo />
        </div>
      </div>
    </GridBackground>
  )
}

export default App

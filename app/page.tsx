"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"
import moment from "moment" // Add moment.js import

// Define types based on the provided structure
type Competitor = {
  id: string
  athlete: {
    displayName: string
  }
  score: string
  status?: {
    type?: {
      shortDetail?: string
    }
    thru?: number
  }
  linescores?: Array<{
    value: number
    teeTime?: string
    linescores: Array<any>; // Hole-by-hole scores
  }>
}

type Event = {
  id: string
  name: string
  date: string
  competitors: Competitor[]
}

interface Group {
  name: string
  players: string[]
  wildcard: string
}

export default function GolfLeaderboard() {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Define the groups based on the user's request
  const groups: Group[] = [
    {
      name: "Phillip",
      players: ["Rory McIlroy", "Bryson DeChambeau"],
      wildcard: "Akshay Bhatia",
    },
    {
      name: "Tay",
      players: ["Scottie Scheffler", "Brooks Koepka"],
      wildcard: "Will Zalatoris",
    },
    {
      name: "Gilb",
      players: ["Collin Morikawa", "Xander Schauffele"],
      wildcard: "Wyndham Clark",
    },
  ]

  const fetchScoreboard = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Use our server-side API route
      const res = await fetch("/api/golf")

      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`)
      }

      const data = await res.json()
      const rawEvent = data.events?.[0]
      const rawCompetition = rawEvent?.competitions?.[0]
      const rawCompetitors = rawCompetition?.competitors ?? []

      if (!rawEvent || !rawCompetitors.length) {
        throw new Error("No competition data available.")
      }

      const competitors = rawCompetitors.map((comp: Competitor) => ({
        id: comp.id,
        athlete: comp.athlete,
        score: comp.score,
        status: comp.status,
        linescores: comp.linescores,
      }))

      setEvent({
        id: rawEvent.id,
        name: rawEvent.name,
        date: rawEvent.date,
        competitors,
      })
    } catch (err) {
      console.error("Error fetching golf data:", err)
      setError("Failed to load scoreboard data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchScoreboard()
  }, [])

  // Find a player in the event by name
  const findPlayerByName = (name: string): Competitor | undefined => {
    if (!event) return undefined
    return event.competitors.find((competitor) => competitor.athlete.displayName.toLowerCase() === name.toLowerCase())
  }

  // Parse score string to number
  const parseScore = (scoreStr: string): number => {
    if (scoreStr === "E") return 0
    return Number.parseInt(scoreStr.replace("+", ""))
  }

  // Calculate total score for a group
  const calculateGroupScore = (group: Group): number => {
    let totalScore = 0

    for (const playerName of group.players) {
      const player = findPlayerByName(playerName)
      if (player) {
        totalScore += parseScore(player.score)
      }
    }

    // Add wildcard player score
    const wildcardPlayer = findPlayerByName(group.wildcard)
    if (wildcardPlayer) {
      totalScore += parseScore(wildcardPlayer.score)
    }

    return totalScore
  }

  // Sort groups by total score (lowest is best in golf)
  const sortedGroups = [...groups].sort((a, b) => calculateGroupScore(a) - calculateGroupScore(b))

  // Format score for display
  const formatScore = (scoreStr: string): string => {
    if (scoreStr === "E") return "E"
    if (scoreStr.startsWith("+")) return scoreStr
    return scoreStr // Already has - for under par
  }

 // Function to calculate Over/Under Par
 const calculateOverUnderPar = (score: number, holesPlayed: number): string => {
  const parValues = [4,5,4,3,4,3,4,5,4,4,4,3,5,4,5,3,4,4]; // PAR per hole
  let totalPar = 0;
  for (let i = 0; i < holesPlayed; i++) {
    totalPar += parValues[i] || 4;
  }
  const diff = score - totalPar;
  return diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : "E";
};

  const getTodayScore = (competitor: Competitor): string => {
    const lineScores = competitor.linescores;
  
    const scores = [
      lineScores?.[0]?.value,
      lineScores?.[1]?.value,
      lineScores?.[2]?.value
    ]
      .filter(val => val !== undefined && val !== 0); // Filter out undefined and 0 values
  
    if (scores.length > 0) {
      return scores.join(" | ");
    }
  
    return "";
  };


  // Get thru or tee time based on available data
  const getThruOrTeeTime = (competitor: Competitor): string => {
    const lineScoreArray2 = competitor?.linescores?.[2]?.linescores;
    const lineScoreArray1 = competitor?.linescores?.[1]?.linescores;
    const lineScoreArray0 = competitor?.linescores?.[0]?.linescores;

    const teeTime = competitor?.linescores?.[0]?.teeTime;

    // Determine Thru or Tee Time based on available data
    const thru =
      (lineScoreArray2?.length > 0 ? lineScoreArray2.length : undefined) ??
      (lineScoreArray1?.length > 0 ? lineScoreArray1.length : undefined) ??
      lineScoreArray0?.length ??
      (teeTime
        ? moment.utc(teeTime).subtract(2, "hours").format("h:mm A")
        : "—");

    return thru.toString();
  };

  // Get status from competitor
  const getStatus = (competitor: Competitor): string => {
    return competitor.status?.type?.shortDetail || "N/A"
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-800">{event?.name || "Golf Tournament"} Groups</h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={fetchScoreboard}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={fetchScoreboard} className="text-red-700 hover:text-red-900 focus:outline-none">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="bg-green-100">
                    <Skeleton className="h-6 w-24" />
                  </CardHeader>
                  <CardContent className="pt-6">
                    {Array(3)
                      .fill(0)
                      .map((_, j) => (
                        <div key={j} className="flex justify-between items-center mb-4">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))}
                  </CardContent>
                </Card>
              ))
          : sortedGroups.map((group, index) => (
              <Card key={group.name} className={`overflow-hidden ${index === 0 ? "border-green-500 border-2" : ""}`}>
                <CardHeader className={`${index === 0 ? "bg-green-100" : "bg-gray-50"}`}>
                  <CardTitle className="flex justify-between">
                    <span>{group.name}</span>
                    <span className="text-green-700">
                      {calculateGroupScore(group) > 0
                        ? `+${calculateGroupScore(group)}`
                        : calculateGroupScore(group) === 0
                          ? "E"
                          : calculateGroupScore(group)}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {index === 0
                      ? "Currently Leading"
                      : `${index + 1}${index === 1 ? "nd" : index === 2 ? "rd" : "th"} Place`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {group.players.map((playerName) => {
                    const player = findPlayerByName(playerName)
                    return (
                      <div key={playerName} className="flex justify-between items-center mb-4">
                        <div>
                          <span className="font-medium">{playerName}</span>
                          {player && (
                            <div className="text-sm text-gray-500">
                              {player.linescores?.[0]?.value !== undefined && `${getTodayScore(player)} `}
                               {/* Use the new function to determine whether to show Thru or Tee Time */}
                               {player.linescores &&
                                `${player.linescores[0]?.linescores?.length ? "| Thru: " : "Tee: "}${getThruOrTeeTime(player)}`}
                               <div>
                               {player.linescores?.[1]?.value
                                ? `Today: ${calculateOverUnderPar(
                                player.linescores[1].value,
                                player.linescores[1]?.linescores?.length || 0
                                )}`
                                : null}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="font-semibold">{player ? formatScore(player.score) : "N/A"}</div>
                      </div>
                    )
                  })}
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                    <div>
                      <span className="font-medium">{group.wildcard}</span>
                      <div className="text-xs text-green-600">Wildcard</div>
                      {findPlayerByName(group.wildcard) && (
                        <div className="text-sm text-gray-500">
                          {/* Use the new function for the wildcard player too */}
                      
                          {findPlayerByName(group.wildcard)?.linescores?.[0]?.value !== undefined &&
                            `${getTodayScore(findPlayerByName(group.wildcard)!)}`}
                            {findPlayerByName(group.wildcard)?.linescores &&
                            `${findPlayerByName(group.wildcard)?.linescores?.[0]?.linescores?.length ? " | Thru: " : "Tee: "}${getThruOrTeeTime(findPlayerByName(group.wildcard)!)}`}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                      {findPlayerByName(group.wildcard)?.linescores?.[1]?.value
                      ? `Today: ${calculateOverUnderPar(
                      findPlayerByName(group.wildcard)!.linescores![1].value,
                      findPlayerByName(group.wildcard)!.linescores![1].linescores?.length || 0
                       )}`
                       : null}
                        </div>
                    </div>
                    <div className="font-semibold">
                      {findPlayerByName(group.wildcard) ? formatScore(findPlayerByName(group.wildcard)!.score) : "N/A"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}

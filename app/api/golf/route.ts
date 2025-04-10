import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Use the scoreboard endpoint as specified
    const response = await fetch("https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`ESPN API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching from ESPN API:", error)
    // Return mock data if the API fails
    return NextResponse.json(MOCK_DATA, { status: 200 })
  }
}

// Mock data to use as fallback if the API fails
const MOCK_DATA = {
  events: [
    {
      id: "401580051",
      name: "Masters Tournament",
      date: "2023-04-09T00:00Z",
      competitions: [
        {
          competitors: [
            {
              id: "1",
              athlete: { displayName: "Scottie Scheffler" },
              score: "-7",
              status: { type: { shortDetail: "F" }, thru: 18 },
              linescores: [{ value: -3, teeTime: "10:00 AM" }],
            },
            {
              id: "2",
              athlete: { displayName: "Bryson DeChambeau" },
              score: "-6",
              status: { type: { shortDetail: "F" }, thru: 18 },
              linescores: [{ value: -2, teeTime: "10:10 AM" }],
            },
            {
              id: "3",
              athlete: { displayName: "Collin Morikawa" },
              score: "-5",
              status: { type: { shortDetail: "F" }, thru: 18 },
              linescores: [{ value: -1, teeTime: "10:20 AM" }],
            },
            {
              id: "4",
              athlete: { displayName: "Xander Schauffele" },
              score: "-4",
              status: { type: { shortDetail: "F" }, thru: 18 },
              linescores: [{ value: -2, teeTime: "10:30 AM" }],
            },
            {
              id: "5",
              athlete: { displayName: "Brooks Koepka" },
              score: "-3",
              status: { type: { shortDetail: "F" }, thru: 18 },
              linescores: [{ value: -1, teeTime: "10:40 AM" }],
            },
            {
              id: "6",
              athlete: { displayName: "Rory McIlroy" },
              score: "-2",
              status: { type: { shortDetail: "F" }, thru: 18 },
              linescores: [{ value: 0, teeTime: "10:50 AM" }],
            },
            {
              id: "7",
              athlete: { displayName: "Will Zalatoris" },
              score: "-1",
              status: { type: { shortDetail: "F" }, thru: 18 },
              linescores: [{ value: -1, teeTime: "11:00 AM" }],
            },
            {
              id: "8",
              athlete: { displayName: "Wyndham Clark" },
              score: "E",
              status: { type: { shortDetail: "F" }, thru: 18 },
              linescores: [{ value: 0, teeTime: "11:10 AM" }],
            },
            {
              id: "9",
              athlete: { displayName: "Akshay Bhatia" },
              score: "+1",
              status: { type: { shortDetail: "F" }, thru: 18 },
              linescores: [{ value: 1, teeTime: "11:20 AM" }],
            },
          ],
        },
      ],
    },
  ],
}

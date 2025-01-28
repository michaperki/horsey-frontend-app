// Leaderboard.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import './Leaderboard.css';

// Define mockData outside the component to prevent re-creation on each render
const mockData = [
  {
    username: "PlayerOne",
    rating: 2500,
    winPercentage: 75,
    games: 40,
  },
  {
    username: "ChessMaster",
    rating: 2400,
    winPercentage: 68,
    games: 35,
  },
  {
    username: "GrandMaster",
    rating: 2300,
    winPercentage: 60,
    games: 30,
  },
  {
    username: "Novice",
    rating: 2200,
    winPercentage: 55,
    games: 25,
  },
  {
    username: "Beginner",
    rating: 2100,
    winPercentage: 50,
    games: 20,
  },
];

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // Flag to toggle between mock data and real data
  const useMockData = false; // Set to false to use real fetched data

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (useMockData) {
        // Simulate network delay
        setTimeout(() => {
          setLeaderboardData(mockData);
          setLoading(false);
        }, 1000); // 1-second delay
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/leaderboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [token, useMockData]); // No need to include mockData

  if (loading) {
    return (
      <div className="leaderboard__loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h1 className="leaderboard__title">Global Leaderboard</h1>
      {leaderboardData.length === 0 ? (
        <div className="leaderboard__no-data">
          No data available yet. Be the first to join the leaderboard!
        </div>
      ) : (
        <div className="leaderboard__table-container">
          <table className="leaderboard__table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Rating</th>
                <th>Win %</th>
                <th>Games</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player, index) => (
                <tr key={player.username}>
                  <td>#{index + 1}</td>
                  <td>{player.username}</td>
                  <td>{player.rating}</td>
                  <td>{player.winPercentage}%</td>
                  <td>{player.games}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

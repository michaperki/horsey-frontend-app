
import React, { useEffect, useState } from "react";
import "./Leaderboard.css"; // External CSS for styling
import { useAuth } from "../contexts/AuthContext";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
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
  }, [token]);

  if (loading) {
    return <div className="leaderboard__loading">Loading...</div>;
  }

  return (
    <div className="leaderboard">
      <h1 className="leaderboard__title">Global Leaderboard</h1>
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
    </div>
  );
};

export default Leaderboard;

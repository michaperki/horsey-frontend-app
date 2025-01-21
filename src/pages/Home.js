
// src/pages/Home.js

import React, { useEffect, useState } from 'react';
import LichessConnect from '../components/Auth/LichessConnect';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/api';
import PlaceBetModal from '../components/PlaceBetModal';
import './Home.css';

const Home = () => {
  const { token } = useAuth();
  const [lichessConnected, setLichessConnected] = useState(false);
  const [lichessUsername, setLichessUsername] = useState('');
  const [loading, setLoading] = useState(true);

  const [statistics, setStatistics] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winPercentage: '0.00',
    karma: 0,
    membership: 'Free',
    points: 0,
  });

  // Modal State
  const [isPlaceBetModalOpen, setIsPlaceBetModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile(token);
        const { user, statistics } = response.data;

        if (user.lichessUsername) {
          setLichessConnected(true);
          setLichessUsername(user.lichessUsername);
        }

        setStatistics(statistics);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <div>Total Games: {statistics.totalGames}</div>
        <div>Wins/Loss: {statistics.wins}/{statistics.losses}</div>
        <div>Win %: {statistics.winPercentage}%</div>
        <div>Karma: {statistics.karma}</div>
        <div>
          Membership: {statistics.membership === 'Free' ? (
            <a href="/membership">Become a Member</a>
          ) : (
            'Premium'
          )}
        </div>
        <div>Points: {statistics.points}</div>
      </header>

      <div className="content">
        <aside className="sidebar">
          <div className="card">
            <h2>Play 1v1</h2>
            <p>Try the most popular game mode!</p>
            <button
              className="button"
              onClick={() => setIsPlaceBetModalOpen(true)} // Open modal on click
            >
              Play 1v1
            </button>
          </div>
        </aside>

        <main className="main">
          <h2>Play Ranked</h2>
          <div className="ranked-options">
            <div className="card">
              <h3>4 Player</h3>
              <p>1/10 placement games played</p>
            </div>
            <div className="card">
              <h3>Chess 960</h3>
              <p>Experience the chaos of random piece setups!</p>
            </div>
          </div>
        </main>
      </div>

      <footer className="footer">
        <button className="footer-button">Create Room</button>
        <button className="footer-button">Play vs Bots</button>
        <button className="footer-button">Play Ranked / Casual</button>
      </footer>

      {/* PlaceBet Modal */}
      <PlaceBetModal
        isOpen={isPlaceBetModalOpen}
        onClose={() => setIsPlaceBetModalOpen(false)} // Close modal
      />
    </div>
  );
};

export default Home;


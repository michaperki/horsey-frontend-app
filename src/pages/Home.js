
import React, { useEffect, useState } from 'react';
import LichessConnect from '../components/Auth/LichessConnect';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/api';
import PlaceBet from '../components/PlaceBet';
import './Home.css'; // Importing the CSS file

const Home = () => {
  const { token } = useAuth();
  const [lichessConnected, setLichessConnected] = useState(false);
  const [lichessUsername, setLichessUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile(token);
        if (profile.lichessUsername) {
          setLichessConnected(true);
          setLichessUsername(profile.lichessUsername);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('lichess') === 'connected') {
      setLichessConnected(true);
    } else if (params.get('lichess') === 'error') {
      const message = params.get('message');
      alert(`Failed to connect Lichess account: ${message}`);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      {/* Header Section */}
      <header className="header">
        <div>Total Games: 290</div>
        <div>Wins/Loss: 55/100</div>
        <div>Win %: 55.56</div>
        <div>Karma: 20/20</div>
        <div>Membership: <a href="#">Become a Member</a></div>
        <div>Points: 1015</div>
      </header>

      <div className="content">
        {/* Sidebar for Play 1v1 */}
        <aside className="sidebar">
          <div className="card">
            <h2>Play 1v1</h2>
            <p>Try the most popular game mode!</p>
            <button className="button">Play 1v1</button>
          </div>
        </aside>

        {/* Main Section */}
        <main className="main">
          <h2>Play Ranked</h2>
          <div className="ranked-options">
            <div className="card">
              <h3>4 Player</h3>
              <p>1/10 placement games played</p>
            </div>
            <div className="card">
              <h3>Fischer Random</h3>
              <p>Experience the chaos of random piece setups!</p>
            </div>
          </div>
        </main>
      </div>

      {/* Footer Section */}
      <footer className="footer">
        <button className="footer-button">Create Room</button>
        <button className="footer-button">Play vs Bots</button>
        <button className="footer-button">Play Ranked / Casual</button>
      </footer>
    </div>
  );
};

export default Home;


// src/features/game/components/ChessClock.jsx
import { useState, useEffect } from 'react';
import './ChessClock.css';

const ChessClock = ({ timeLeft, isRunning, isActive }) => {
  const [displayTime, setDisplayTime] = useState(timeLeft);
  
  // Format time as mm:ss or mm:ss.t (if less than 10 seconds)
  const formatTime = (seconds) => {
    if (seconds <= 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    
    if (seconds < 10) {
      return `${minutes}:${String(secs).padStart(2, '0')}.${tenths}`;
    }
    
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };
  
  // Update the display time when the actual time changes
  useEffect(() => {
    setDisplayTime(timeLeft);
  }, [timeLeft]);
  
  // Set up an interval to update the clock display when running
  useEffect(() => {
    let interval = null;
    
    if (isRunning) {
      // Update more frequently when under 10 seconds for tenths display
      const updateFrequency = displayTime < 10 ? 100 : 1000;
      
      interval = setInterval(() => {
        setDisplayTime(prevTime => {
          const newTime = Math.max(0, prevTime - (updateFrequency / 1000));
          return newTime;
        });
      }, updateFrequency);
    } else {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, displayTime]);
  
  return (
    <div className={`chess-clock ${isActive ? 'active' : ''} ${displayTime < 30 ? 'low-time' : ''}`}>
      <div className="time-display">{formatTime(displayTime)}</div>
    </div>
  );
};

export default ChessClock;

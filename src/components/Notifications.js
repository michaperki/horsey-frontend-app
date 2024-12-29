
// src/components/Notifications.js

import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const Notifications = () => {
  const { user } = useAuth(); // Use AuthContext

  return (
    <div style={styles.container}>
      <h2>Notifications</h2>
      {user ? (
        <p>Welcome back, {user.username}!</p>
      ) : (
        <p>Please log in to see your notifications.</p>
      )}
      <p>Notifications will be displayed here.</p>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "400px",
    margin: "auto",
    backgroundColor: "#f1f1f1",
    borderRadius: "8px",
    marginTop: "50px",
    textAlign: "center",
  },
};

export default Notifications;


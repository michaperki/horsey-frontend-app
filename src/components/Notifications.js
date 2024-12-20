// components/Notifications.js
//
import React from 'react';
import jwtDecode from 'jwt-decode';

const Notifications = () => {
    const token = localStorage.getItem('token');
    let user = null;

    if (token) {
        try {
            user = jwtDecode(token);
        } catch (error) {
            console.error('Invalid token:', error);
        }
    }

    return (
        <div style={styles.container}>
            <h2>Notifications</h2>
            <p>Notifications will be displayed here.</p>
        </div>
    );
}

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

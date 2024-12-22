// components/Profile.js
//
import React from 'react';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
    const token = localStorage.getItem('token');
    let user = null;

    if (token) {
        try {
            user = jwtDecode(token);
        } catch (error) {
            console.error('Invalid token:', error);
        }
    }

    if (!user) {
        return <p>No user data available.</p>;
    }

    return (
        <div style={styles.container}>
            <h2>Profile</h2>
            <p>
                <strong>Name:</strong> <span>{user.name || 'N/A'}</span>
            </p>
            <p>
                <strong>Email:</strong> <span>{user.email || 'N/A'}</span>
            </p>
            <p>
                <strong>Role:</strong> <span>{user.role || 'N/A'}</span>
            </p>
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

export default Profile;

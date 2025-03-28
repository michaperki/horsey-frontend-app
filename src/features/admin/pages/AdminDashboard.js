// AdminDashboard.js
//
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (token) {
            try {
                const user = jwtDecode(token);
                if (user.role !== 'admin') {
                    throw new Error('Unauthorized access');
                }
            } catch (error) {
                console.error('Invalid token or insufficient permissions:', error);
                navigate('/login'); // Redirect to login
            }
        } else {
            navigate('/login'); // Redirect to login if no token
        }
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/'); // Redirect to home
    };

    return (
        <div style={styles.container}>
            <h2>Admin Dashboard</h2>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
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
    link: {
        display: "block",
        padding: "10px",
        backgroundColor: "#007bff",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "4px",
        margin: "10px 0",
    },
    button: {
        width: "100%",
        padding: "10px",
        backgroundColor: "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
    },
};

export default AdminDashboard;

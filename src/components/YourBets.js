
// src/components/YourBets.js

import React, { useEffect, useState } from 'react';
import { getUserBets } from '../services/api';

const YourBets = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const limit = 10; // Number of bets per page

  useEffect(() => {
    const fetchBets = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your bets.');
          return;
        }

        const params = { page, limit, sortBy, order };
        const data = await getUserBets(token, params);

        if (data && data.bets) {
          setBets(data.bets);
          setTotalPages(data.totalPages);
        } else {
          setError('Unexpected response from the server.');
        }
      } catch (error) {
        setError(error.message || 'An error occurred while fetching your bets.');
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [page, sortBy, order]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div style={styles.container}>
      <h3>Your Bets</h3>
      {loading ? (
        <p>Loading your bets...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : bets.length === 0 ? (
        <p>You have not placed any bets yet.</p>
      ) : (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('gameId')} style={styles.sortable}>
                  Game ID {sortBy === 'gameId' ? (order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('creatorColor')} style={styles.sortable}>
                  Your Choice {sortBy === 'creatorColor' ? (order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('finalWhiteId')} style={styles.sortable}>
                  Final White {sortBy === 'finalWhiteId' ? (order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('finalBlackId')} style={styles.sortable}>
                  Final Black {sortBy === 'finalBlackId' ? (order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('amount')} style={styles.sortable}>
                  Amount {sortBy === 'amount' ? (order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('status')} style={styles.sortable}>
                  Status {sortBy === 'status' ? (order === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => handleSort('createdAt')} style={styles.sortable}>
                  Date {sortBy === 'createdAt' ? (order === 'asc' ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet._id}>
                  <td>{bet.gameId}</td>
                  <td>
                    {bet.creatorColor
                      ? bet.creatorColor.charAt(0).toUpperCase() + bet.creatorColor.slice(1)
                      : 'N/A'}
                  </td>
                  <td>{bet.finalWhiteId?.username || 'N/A'}</td>
                  <td>{bet.finalBlackId?.username || 'N/A'}</td>
                  <td>{bet.amount}</td>
                  <td>
                    {bet.status
                      ? bet.status.charAt(0).toUpperCase() + bet.status.slice(1)
                      : 'N/A'}
                  </td>
                  <td>{new Date(bet.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div style={styles.pagination}>
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              style={{
                ...styles.pageButton,
                ...(page === 1 ? styles.pageButton.disabled : {}),
              }}
            >
              Previous
            </button>
            <span style={styles.pageInfo}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              style={{
                ...styles.pageButton,
                ...(page === totalPages ? styles.pageButton.disabled : {}),
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Inline Styles for Simplicity
const styles = {
  container: {
    marginTop: "30px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  sortable: {
    cursor: "pointer",
    userSelect: "none",
  },
  pagination: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  pageButton: {
    padding: "8px 16px",
    margin: "0 10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    disabled: {
      backgroundColor: "#ccc",
      cursor: "not-allowed",
    },
  },
  pageInfo: {
    fontSize: "1em",
  },
  error: {
    color: "red",
  },
};

export default YourBets;


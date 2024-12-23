
// frontend/src/components/BetHistory.js
import React, { useEffect, useState } from 'react';

const BetHistory = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');

  const limit = 10; // Define limit as a constant

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchBets = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token'); // Adjust based on your auth implementation
        const query = new URLSearchParams({ page, limit, sortBy, order }).toString();
        const response = await fetch(`/bets/history?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bet history.');
        }

        const data = await response.json();
        setBets(data.bets);
        setTotalPages(data.totalPages);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to fetch bet history.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBets();

    // Cleanup function to abort fetch on unmount
    return () => {
      controller.abort();
    };
  }, [page, sortBy, order]); // Removed 'limit' from dependencies

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  return (
    <div>
      <h2>Your Bet History</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('gameId')}>Game ID</th>
                <th onClick={() => handleSort('choice')}>Choice</th>
                <th onClick={() => handleSort('amount')}>Amount</th>
                <th onClick={() => handleSort('status')}>Status</th>
                <th onClick={() => handleSort('createdAt')}>Date</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet._id}>
                  <td>{bet.gameId}</td>
                  <td>{bet.choice}</td>
                  <td>{bet.amount}</td>
                  <td>{bet.status}</td>
                  <td>{new Date(bet.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BetHistory;


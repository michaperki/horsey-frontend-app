// src/components/YourBets.js
import React, { useEffect, useState } from "react";
import {
  getUserBets,
  cancelBet,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const YourBets = () => {
  const { token, user } = useAuth();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // Filters
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minWager, setMinWager] = useState("");
  const [maxWager, setMaxWager] = useState("");

  useEffect(() => {
    fetchBets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, order]);

  const fetchBets = async (overrideParams) => {
    if (!token) {
      setError("Please log in to view your bets.");
      return;
    }

    setLoading(true);
    setError("");

    // Build query params
    const params = {
      page,
      limit,
      sortBy,
      order,
      // Include existing filters
      status: overrideParams?.status ?? status,
      fromDate: overrideParams?.fromDate ?? fromDate,
      toDate: overrideParams?.toDate ?? toDate,
      minWager: overrideParams?.minWager ?? minWager,
      maxWager: overrideParams?.maxWager ?? maxWager,
    };

    // Remove empty filters
    Object.keys(params).forEach((k) => {
      if (!params[k]) delete params[k];
    });

    try {
      const data = await getUserBets(token, params);

      if (data && data.bets) {
        setBets(data.bets);
        setTotalPages(data.totalPages || 1);
      } else {
        setError("Unexpected response from the server.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching your bets.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    // Reset page to 1 on filter change
    setPage(1);
    fetchBets();
  };

  // Sorting by clicking headers
  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  // Pagination
  const handlePreviousPage = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));

  // Cancel bet logic
  const handleCancelBet = async (betId) => {
    setError("");
    if (!token || !user) {
      setError("You must be logged in to cancel a bet.");
      return;
    }

    try {
      const confirmCancel = window.confirm("Are you sure you want to cancel this bet?");
      if (!confirmCancel) return;

      // Call the API
      await cancelBet(token, betId);

      // Remove the bet from local state
      setBets((prev) => prev.filter((b) => b._id !== betId));
    } catch (err) {
      setError(err.message || "Failed to cancel the bet.");
    }
  };

  // Render
  return (
    <div style={styles.container}>
      <h3>Your Bets</h3>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <label>Status: </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="matched">Matched</option>
          <option value="canceled">Canceled</option>
          <option value="expired">Expired</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>

        <label>From:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <label>To:</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <label>Min Wager:</label>
        <input
          type="number"
          value={minWager}
          onChange={(e) => setMinWager(e.target.value)}
          style={{ width: "80px" }}
        />
        <label>Max Wager:</label>
        <input
          type="number"
          value={maxWager}
          onChange={(e) => setMaxWager(e.target.value)}
          style={{ width: "80px" }}
        />

        <button onClick={handleApplyFilter}>Apply Filters</button>
      </div>

      {loading && <p>Loading your bets...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && bets.length === 0 && (
        <p>You have not placed any bets yet.</p>
      )}

      {!loading && !error && bets.length > 0 && (
        <>
          <table style={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort("gameId")} style={styles.sortable}>
                  Game ID {sortBy === "gameId" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("amount")} style={styles.sortable}>
                  Amount {sortBy === "amount" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("status")} style={styles.sortable}>
                  Status {sortBy === "status" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("createdAt")} style={styles.sortable}>
                  Created {sortBy === "createdAt" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet._id}>
                  <td>{bet.gameId || "N/A"}</td>
                  <td>{bet.amount}</td>
                  <td
                    style={{
                      color:
                        bet.status === "canceled" || bet.status === "expired"
                          ? "red"
                          : "inherit",
                    }}
                  >
                    {bet.status}
                  </td>
                  <td>{new Date(bet.createdAt).toLocaleString()}</td>
                  <td>
                    {/* Show "Cancel" if pending & user is creator */}
                    {bet.status === "pending" &&
                      bet.creatorId._id === user?.id && (
                        <button
                          style={styles.cancelBtn}
                          onClick={() => handleCancelBet(bet._id)}
                        >
                          Cancel
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={styles.pagination}>
            <button onClick={handlePreviousPage} disabled={page === 1}>
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { padding: 20 },
  filterBar: {
    marginBottom: 20,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  sortable: {
    cursor: "pointer",
  },
  cancelBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "5px 8px",
    cursor: "pointer",
  },
  pagination: {
    marginTop: 10,
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
};

export default YourBets;

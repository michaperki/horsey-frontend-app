// src/components/YourBets.js
import React, { useEffect, useState } from "react";
import {
  getUserBets,
  cancelBet,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "./YourBets.css"; // Import the updated CSS file

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
    <div className="p-md">
      <h3 className="text-lg mb-md">Your Bets</h3>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-item">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="matched">Matched</option>
            <option value="canceled">Canceled</option>
            <option value="expired">Expired</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div className="filter-item">
          <label htmlFor="fromDate">From:</label>
          <input
            type="date"
            id="fromDate"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label htmlFor="toDate">To:</label>
          <input
            type="date"
            id="toDate"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <label htmlFor="minWager">Min Wager:</label>
          <input
            type="number"
            id="minWager"
            value={minWager}
            onChange={(e) => setMinWager(e.target.value)}
            className="wager-input"
          />
        </div>

        <div className="filter-item">
          <label htmlFor="maxWager">Max Wager:</label>
          <input
            type="number"
            id="maxWager"
            value={maxWager}
            onChange={(e) => setMaxWager(e.target.value)}
            className="wager-input"
          />
        </div>

        <button onClick={handleApplyFilter} className="apply-filters-button">
          Apply Filters
        </button>
      </div>

      {loading && <p>Loading your bets...</p>}
      {error && <p className="text-danger mb-md">{error}</p>}
      {!loading && !error && bets.length === 0 && (
        <p>You have not placed any bets yet.</p>
      )}

      {!loading && !error && bets.length > 0 && (
        <>
          <table className="w-full border-collapse mb-md">
            <thead>
              <tr>
                <th
                  onClick={() => handleSort("gameId")}
                  className="text-center cursor-pointer"
                >
                  Game ID {sortBy === "gameId" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th
                  onClick={() => handleSort("amount")}
                  className="text-center cursor-pointer"
                >
                  Amount {sortBy === "amount" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th
                  onClick={() => handleSort("currencyType")}
                  className="text-center cursor-pointer"
                >
                  Currency {sortBy === "currencyType" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="text-center cursor-pointer"
                >
                  Status {sortBy === "status" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="text-center cursor-pointer"
                >
                  Created {sortBy === "createdAt" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet._id} className="hover:bg-gray-100">
                  <td className="py-2">{bet.gameId || "N/A"}</td>
                  <td className="py-2">{bet.amount}</td>
                  <td className="py-2">
                    {bet.currencyType.charAt(0).toUpperCase() + bet.currencyType.slice(1)}
                  </td>
                  <td className={`py-2 ${bet.status === "canceled" || bet.status === "expired" ? "text-danger" : ""}`}>
                    {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                  </td>
                  <td className="py-2">
                    {new Date(bet.createdAt).toLocaleString()}
                  </td>
                  <td className="py-2">
                    {/* Show "Cancel" if pending & user is creator */}
                    {bet.status === "pending" &&
                      bet.creatorId._id === user?.id && (
                        <button
                          className="cancel-button"
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
          <div className="flex justify-center gap-5 items-center">
            <button onClick={handlePreviousPage} disabled={page === 1} className="btn btn-secondary">
              Prev
            </button>
            <span className="font-semibold">
              Page {page} of {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={page === totalPages} className="btn btn-secondary">
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default YourBets;

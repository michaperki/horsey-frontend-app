import React, { useEffect, useState } from "react";
import { getUserBets, cancelBet } from "../services/api";
import { useAuth } from 'features/auth/contexts/AuthContext';
import { ApiError } from "../../common/components/ApiError";
import { useApiError } from "../../common/contexts/ApiErrorContext";
import "./YourBets.css";

const YourBets = () => {
  const { token, user } = useAuth();
  const { handleApiError } = useApiError();
  
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError({
        code: 'AUTH_ERROR',
        message: "Please log in to view your bets."
      });
      return;
    }

    setLoading(true);
    setError(null);

    const params = {
      page,
      limit,
      sortBy,
      order,
      status: overrideParams?.status ?? status,
      fromDate: overrideParams?.fromDate ?? fromDate,
      toDate: overrideParams?.toDate ?? toDate,
      minWager: overrideParams?.minWager ?? minWager,
      maxWager: overrideParams?.maxWager ?? maxWager,
    };

    Object.keys(params).forEach((k) => {
      if (!params[k]) delete params[k];
    });

    try {
      const getUserBetsWithHandling = handleApiError(getUserBets, {
        showGlobalError: false,
        onError: (err) => setError(err)
      });
      const data = await getUserBetsWithHandling(params);

      if (data && data.bets) {
        setBets(data.bets);
        setTotalPages(data.totalPages || 1);
      } else {
        setError({
          code: 'DATA_ERROR',
          message: "Unexpected response from the server."
        });
      }
    } catch (err) {
      // Error handled by handleApiError
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setPage(1);
    fetchBets();
  };

  const handleClearFilter = () => {
    setStatus("");
    setFromDate("");
    setToDate("");
    setMinWager("");
    setMaxWager("");
    setPage(1);
    setSortBy("createdAt");
    setOrder("desc");
    fetchBets({
      status: "",
      fromDate: "",
      toDate: "",
      minWager: "",
      maxWager: ""
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  };

  const handlePreviousPage = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setPage((prev) => Math.min(prev + 1, totalPages));

  const handleCancelBet = async (betId) => {
    setError(null);
    if (!token || !user) {
      setError({
        code: 'AUTH_ERROR',
        message: "You must be logged in to cancel a bet."
      });
      return;
    }

    try {
      const confirmCancel = window.confirm("Are you sure you want to cancel this bet?");
      if (!confirmCancel) return;

      const cancelBetWithHandling = handleApiError(cancelBet, {
        showGlobalError: true,
        onSuccess: () => {
          setBets((prev) =>
            prev.map(b => b._id === betId ? { ...b, status: 'canceled' } : b)
          );
        }
      });
      await cancelBetWithHandling(betId);
    } catch (err) {
      // Error handled by handleApiError
    }
  };

  return (
    <div className="p-md">
      <h3 className="text-lg mb-md">Your Bets</h3>

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

        <div className="filter-actions">
          <button onClick={handleApplyFilter} className="apply-filters-button">
            Apply Filters
          </button>
          <button onClick={handleClearFilter} className="clear-filters-button">
            Clear Filters
          </button>
        </div>
      </div>

      {loading && <p>Loading your bets...</p>}
      
      {error && (
        <div className="error-container mb-md">
          <ApiError 
            error={error} 
            onDismiss={() => setError(null)}
            onRetry={fetchBets}
          />
        </div>
      )}
      
      {!loading && !error && bets.length === 0 && (
        <p>You have not placed any bets yet.</p>
      )}

      {!loading && !error && bets.length > 0 && (
        <>
          <table className="w-full border-collapse mb-md">
            <thead>
              <tr>
                <th onClick={() => handleSort("gameId")} className="text-center cursor-pointer">
                  Game ID {sortBy === "gameId" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("amount")} className="text-center cursor-pointer">
                  Amount {sortBy === "amount" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("currencyType")} className="text-center cursor-pointer">
                  Currency {sortBy === "currencyType" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("status")} className="text-center cursor-pointer">
                  Status {sortBy === "status" ? (order === "asc" ? "▲" : "▼") : ""}
                </th>
                <th onClick={() => handleSort("createdAt")} className="text-center cursor-pointer">
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
                  <td className="py-2">{new Date(bet.createdAt).toLocaleString()}</td>
                  <td className="py-2">
                    {bet.status === "pending" && bet.creatorId._id === user?.id && (
                      <button className="cancel-button" onClick={() => handleCancelBet(bet._id)}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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

import { useState, useEffect } from "react";
import { getHistory, deleteEntry, clearHistory } from "../services/historyService.js";
import HistoryList from "../components/HistoryList.jsx";
import OutputPannel from "../components/OutputPannel.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import toast from "react-hot-toast";
import "../styles/history.css";

function HistoryPage() {
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filter, setFilter] = useState("");

  const fetchHistory = async (pageNumber, currentFilter) => {
    setLoading(true);
    try {
      const data = await getHistory(pageNumber, 5, currentFilter);
      setEntries(data.entries);
      setTotalPages(data.totalPages);
      setPage(data.currentPage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load history entries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page, filter);
  }, [page, filter]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;
    try {
      await deleteEntry(id);
      toast.success("Entry deleted");
      if (entries.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchHistory(page, filter);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete entry");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear your entire history?")) return;
    try {
      await clearHistory();
      toast.success("History cleared");
      setPage(1);
      fetchHistory(1, filter);
    } catch (error) {
      console.error(error);
      toast.error("Failed to clear history");
    }
  };

  const closeDetailModal = () => {
    setSelectedEntry(null);
  };

  return (
    <div className="history-container animate-fade-slide">
      <div className="history-page-header">
        <h1>Translation History</h1>
        <div className="history-header-actions">
          <div className="history-filters">
            <button
              className={`filter-btn ${filter === "" ? "active" : ""}`}
              onClick={() => handleFilterChange("")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === "translate" ? "active" : ""}`}
              onClick={() => handleFilterChange("translate")}
            >
              Translations
            </button>
            <button
              className={`filter-btn ${filter === "explain" ? "active" : ""}`}
              onClick={() => handleFilterChange("explain")}
            >
              Explanations
            </button>
            <button
              className={`filter-btn ${filter === "complexity" ? "active" : ""}`}
              onClick={() => handleFilterChange("complexity")}
            >
              Complexity
            </button>
            <button
              className={`filter-btn ${filter === "optimize" ? "active" : ""}`}
              onClick={() => handleFilterChange("optimize")}
            >
              Optimizations
            </button>
          </div>
          <button
            className="history-clear-btn"
            onClick={handleClearAll}
            disabled={loading || entries.length === 0}
          >
            Clear History
          </button>
        </div>
      </div>

      {loading && entries.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", margin: "80px 0" }}>
          <div className="spinner"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="history-empty-state">
          <h3>No logs found</h3>
          <p>Translate, analyze or optimize code to see items here.</p>
        </div>
      ) : (
        <>
          <HistoryList
            entries={entries}
            onSelect={setSelectedEntry}
            onDelete={handleDelete}
          />

          {totalPages > 1 && (
            <div className="history-pagination">
              <button
                className="history-page-btn"
                onClick={() => setPage(page - 1)}
                disabled={page === 1 || loading}
              >
                Previous
              </button>
              <span className="history-page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="history-page-btn"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages || loading}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal for detailed view */}
      {selectedEntry && (
        <div className="history-modal-overlay" onClick={closeDetailModal}>
          <div className="history-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="history-modal-header">
              <span className="history-modal-title">
                Log Details - {selectedEntry.action.toUpperCase()}
              </span>
              <button className="history-modal-close" onClick={closeDetailModal}>
                ✕
              </button>
            </div>
            <div className="history-modal-body">
              <div className="history-modal-grid">
                <div className="history-modal-column">
                  <span className="history-modal-label">
                    Source Code ({selectedEntry.sourceLanguage})
                  </span>
                  <div className="history-modal-box">
                    <CodeEditor
                      code={selectedEntry.sourceCode}
                      language={selectedEntry.sourceLanguage}
                      readonly={true}
                    />
                  </div>
                </div>

                <div className="history-modal-column">
                  <span className="history-modal-label">
                    Output Result {selectedEntry.action === "translate" ? `(${selectedEntry.targetLanguage})` : ""}
                  </span>
                  <div className="history-modal-box">
                    <OutputPannel
                      result={selectedEntry}
                      action={selectedEntry.action}
                      targetLanguage={selectedEntry.targetLanguage}
                      loading={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;

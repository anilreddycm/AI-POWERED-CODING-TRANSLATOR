import React from "react";
import "../styles/history.css";

function HistoryList({ entries, onSelect, onDelete }) {
  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getActionName = (action) => {
    if (action === "translate") return "Translate";
    if (action === "complexity") return "Complexity";
    if (action === "explain") return "Explain";
    if (action === "optimize") return "Optimize";
    return action;
  };

  return (
    <div className="history-list">
      {entries.map((entry) => (
        <div
          key={entry._id}
          className="history-card"
          onClick={() => onSelect(entry)}
        >
          <div className="history-card-header">
            <div className="history-card-left">
              <span className={`history-action-badge ${entry.action}`}>
                {getActionName(entry.action)}
              </span>
              <span className="history-date">{formatDate(entry.createdAt)}</span>
            </div>
            <button
              className="history-delete-btn"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card selection triggering
                onDelete(entry._id);
              }}
              title="Delete entry"
            >
              ✕
            </button>
          </div>

          <div className="history-languages">
            {entry.sourceLanguage}
            {entry.action === "translate" && (
              <>
                <span>→</span>
                {entry.targetLanguage}
              </>
            )}
          </div>

          <div className="history-code-preview">
            {entry.sourceCode ? entry.sourceCode.slice(0, 120) : "No source code"}
            {entry.sourceCode && entry.sourceCode.length > 120 ? "..." : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HistoryList;

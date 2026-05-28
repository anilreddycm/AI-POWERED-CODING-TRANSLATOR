import { useState, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import "../styles/outputs.css";

function OutputPannel({ result, action, targetLanguage, loading }) {
  const [statusIdx, setStatusIdx] = useState(0);

  const statuses = [
    "Analyzing syntax trees...",
    "Converting logic structures...",
    "Optimizing performance loops...",
    "Finalizing code layout..."
  ];

  useEffect(() => {
    if (!loading) return;
    setStatusIdx(0);
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % statuses.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <div className="skeleton-container">
        <div className="skeleton-header">
          <div className="skeleton-dot"></div>
          <div className="skeleton-dot"></div>
          <div className="skeleton-dot"></div>
        </div>
        <div className="skeleton-lines">
          <div className="skeleton-line" style={{ width: "80%" }}></div>
          <div className="skeleton-line" style={{ width: "95%" }}></div>
          <div className="skeleton-line" style={{ width: "60%" }}></div>
          <div className="skeleton-line" style={{ width: "75%" }}></div>
          <div className="skeleton-line" style={{ width: "90%" }}></div>
          <div className="skeleton-line" style={{ width: "40%" }}></div>
        </div>
        <div className="output-loading-overlay">
          <div className="ai-pulse-ring">
            <div className="ai-pulse-dot"></div>
          </div>
          <p className="loading-status-text">{statuses[statusIdx]}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="empty-state">
        <p>
          Write or paste code on the left, pick an action, and hit <span>Run Action</span> to see the results here.
        </p>
      </div>
    );
  }

  if (action === "translate") {
    return (
      <div className="output-full-height animate-slide-in">
        <CodeEditor
          code={result.translatedCode || ""}
          language={targetLanguage}
          readonly={true}
        />
      </div>
    );
  }

  // Simple markdown renderer for explanation, complexity, and optimization
  const renderMarkdown = (text) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const code = match ? match[2] : part.slice(3, -3);
        const lang = match ? match[1] : "";
        return (
          <div key={i} className="output-code-block" style={{ height: "300px", margin: "16px 0" }}>
            <CodeEditor code={code.trim()} language={lang} readonly={true} />
          </div>
        );
      }

      return (
        <div key={i} className="markdown-text">
          {part.split("\n").map((line, idx) => {
            if (line.startsWith("### ")) {
              return <h3 key={idx}>{line.substring(4)}</h3>;
            }
            if (line.startsWith("## ")) {
              return <h2 key={idx}>{line.substring(3)}</h2>;
            }
            if (line.startsWith("# ")) {
              return <h1 key={idx}>{line.substring(2)}</h1>;
            }
            if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
              const content = line.trim().substring(2);
              return (
                <ul key={idx} style={{ margin: "4px 0 4px 20px" }}>
                  <li dangerouslySetInnerHTML={{
                    __html: content
                      .replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/`([\s\S]*?)`/g, '<code>$1</code>')
                  }} />
                </ul>
              );
            }
            if (line.trim() === "") {
              return <div key={idx} style={{ height: "8px" }} />;
            }
            return (
              <p key={idx} dangerouslySetInnerHTML={{
                __html: line
                  .replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/`([\s\S]*?)`/g, '<code>$1</code>')
              }} />
            );
          })}
        </div>
      );
    });
  };

  const getOutputText = () => {
    if (action === "complexity") return result.complexityAnalysis;
    if (action === "explain") return result.explanation;
    if (action === "optimize") return result.optimization;
    return "";
  };

  return (
    <div className="output-text-container animate-slide-in">
      {renderMarkdown(getOutputText())}
    </div>
  );
}

export default OutputPannel;
import CodeEditor from "./CodeEditor";
import "../styles/outputs.css";

function OutputPannel({ result, action, targetLanguage, loading }) {
  if (loading) {
    return (
      <div className="output-loading">
        <div className="spinner"></div>
        <p>AI is processing your request...</p>
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
      <div className="output-full-height">
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
    <div className="output-text-container">
      {renderMarkdown(getOutputText())}
    </div>
  );
}

export default OutputPannel;
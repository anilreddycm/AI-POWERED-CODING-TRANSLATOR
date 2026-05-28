import { useState } from "react";
import CodeEditor from "../components/CodeEditor.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";
import OutputPannel from "../components/OutputPannel.jsx";
import { translateCode, analyzeComplexity, explainCode, optimizeCode } from "../services/codeService.js";
import toast from "react-hot-toast";
import "../styles/home.css";

const defaultCode = `// Write or paste your code here to begin
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
`;

function HomePage() {
  const [code, setCode] = useState(defaultCode);
  const [sourceLang, setSourceLang] = useState("javascript");
  const [targetLang, setTargetLang] = useState("python");
  const [action, setAction] = useState("translate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleActionClick = async (selectedAction) => {
    if (!code.trim()) {
      return toast.error("Please enter some code to run.");
    }

    setAction(selectedAction);
    setLoading(true);
    setResult(null);

    try {
      let data;
      if (selectedAction === "translate") {
        data = await translateCode(code, sourceLang, targetLang);
      } else if (selectedAction === "complexity") {
        data = await analyzeComplexity(code, sourceLang);
      } else if (selectedAction === "explain") {
        data = await explainCode(code, sourceLang);
      } else if (selectedAction === "optimize") {
        data = await optimizeCode(code, sourceLang);
      }

      setResult(data);
      toast.success("Processed successfully!");
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || "Action failed. Check API configurations.";
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page-container">
      {/* Translation Bar */}
      <div className="translation-bar">
        <div className="translation-bar-group">
          <span className="translation-bar-label">Source Language</span>
          <LanguageSelector
            value={sourceLang}
            onChange={setSourceLang}
            disabled={loading}
          />
        </div>
        <span className="translation-bar-to">Translate To</span>
        <div className="translation-bar-group">
          <span className="translation-bar-label">Target Language</span>
          <LanguageSelector
            value={targetLang}
            onChange={setTargetLang}
            disabled={loading}
          />
        </div>
      </div>

      <div className="home-layout">
        {/* Editor Panel */}
        <div className="editor-panel">
          <div className="panel-header">
            <div className="panel-title">Source Code</div>
          </div>
          <div className="editor-content">
            <CodeEditor
              code={code}
              onChange={setCode}
              language={sourceLang}
              readonly={loading}
            />
          </div>
          <div className="panel-footer">
            <div className="action-buttons-group">
              <button
                type="button"
                className={`action-btn ${action === "translate" ? "active" : ""}`}
                onClick={() => handleActionClick("translate")}
                disabled={loading}
              >
                Translate Code
              </button>
              <button
                type="button"
                className={`action-btn ${action === "complexity" ? "active" : ""}`}
                onClick={() => handleActionClick("complexity")}
                disabled={loading}
              >
                Analyze Complexity
              </button>
              <button
                type="button"
                className={`action-btn ${action === "explain" ? "active" : ""}`}
                onClick={() => handleActionClick("explain")}
                disabled={loading}
              >
                Explain Code
              </button>
              <button
                type="button"
                className={`action-btn ${action === "optimize" ? "active" : ""}`}
                onClick={() => handleActionClick("optimize")}
                disabled={loading}
              >
                Optimize Code
              </button>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="output-panel">
          <div className="panel-header">
            <div className="panel-title">Output Result</div>
          </div>
          <div className="output-content">
            <OutputPannel
              result={result}
              action={action}
              targetLanguage={targetLang}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

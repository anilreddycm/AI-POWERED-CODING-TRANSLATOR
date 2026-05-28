import { useContext } from "react";
import Editor from "@monaco-editor/react";
import { ThemeContext } from "../context/ThemeContext.jsx";

function CodeEditor({ code, onChange, language, readonly = false }) {
  const { theme } = useContext(ThemeContext);

  // Normalize language names for Monaco editor
  const getMonacoLanguage = (lang) => {
    if (lang === "cpp") return "cpp";
    if (lang === "csharp") return "csharp";
    return lang;
  };

  return (
    <div 
      className="code-editor-container" 
      style={{ 
        height: "100%", 
        width: "100%", 
        borderRadius: "8px", 
        overflow: "hidden", 
        border: "1px solid var(--border-color)",
        transition: "border-color var(--transition-speed) ease"
      }}
    >
      <Editor
        height="100%"
        language={getMonacoLanguage(language)}
        value={code}
        onChange={(val) => onChange && onChange(val || "")}
        options={{
          readOnly: readonly,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          lineNumbers: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          theme: theme === "dark" ? "vs-dark" : "vs-light",
          wordWrap: "on",
        }}
      />
    </div>
  );
}

export default CodeEditor;

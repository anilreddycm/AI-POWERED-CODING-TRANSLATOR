export const SUPPORTED_LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "csharp", name: "C#" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
  { id: "ruby", name: "Ruby" },
  { id: "php", name: "PHP" },
  { id: "html", name: "HTML" },
  { id: "css", name: "CSS" },
];

function LanguageSelector({ value, onChange, disabled }) {
  return (
    <select
      className="lang-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}

export default LanguageSelector;
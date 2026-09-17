/**
 * Intelligent Language Detector Engine (Multi-Feature Score Based)
 * Detects programming languages accurately from code syntax signatures or file extensions.
 * Supports Python, JavaScript, TypeScript, Java, C/C++, C#, Go, Rust, PHP, Ruby, Shell, Dockerfile, YAML, SQL.
 */

export function detectLanguage(code = '', filename = '') {
  // 1. Extension-based detection
  if (filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['joblib', 'pkl', 'bin', 'h5', 'onnx', 'pt', 'pth', 'dat', 'so', 'dll', 'exe', 'pyc', 'pyo', 'db', 'sqlite', 'sqlite3', 'mako', 'pb', 'model', 'weights', 'restored', 'bak', 'backup', 'tmp', 'old'].includes(ext)) return 'txt';
    if (['py', 'pyw'].includes(ext)) return 'python';
    if (['js', 'jsx', 'mjs', 'cjs'].includes(ext)) return 'javascript';
    if (['ts', 'tsx'].includes(ext)) return 'typescript';
    if (['dockerfile', 'dockerignore'].includes(ext) || filename.toLowerCase() === 'dockerfile') return 'dockerfile';
    if (['java', 'class', 'jar'].includes(ext)) return 'java';
    if (['go'].includes(ext)) return 'go';
    if (['c', 'cpp', 'cc', 'h', 'hpp', 'cxx'].includes(ext)) return 'c';
    if (['cs'].includes(ext)) return 'csharp';
    if (['php', 'phtml', 'php5', 'php7', 'php8'].includes(ext)) return 'php';
    if (['rs'].includes(ext)) return 'rust';
    if (['rb', 'erb'].includes(ext)) return 'ruby';
    if (['sh', 'bash', 'zsh', 'ash'].includes(ext)) return 'shell';
    if (['yaml', 'yml'].includes(ext)) return 'yaml';
    if (['html', 'htm'].includes(ext)) return 'html';
    if (['sql'].includes(ext)) return 'sql';
    if (['json', 'jsonl', 'csv', 'tsv'].includes(ext)) return 'json';
    if (['md', 'markdown'].includes(ext)) return 'markdown';
    if (['txt', 'log', 'env', 'example'].includes(ext)) return 'txt';
  }

  const trimmed = code.trim();
  if (!trimmed) return 'javascript';

  // 2. High-Confidence Direct Prefix Signatures
  if (/^<\?php/i.test(trimmed)) return 'php';
  if (/^#!\/(bin|usr\/bin)\/(bash|sh|zsh)/.test(trimmed)) return 'shell';
  if (/^FROM\s+[a-zA-Z0-9_\-\.\/:]+/m.test(trimmed)) return 'dockerfile';
  if (/^(apiVersion:|kind:|services:|version:\s*['"]?[0-9])/m.test(trimmed)) return 'yaml';

  // 3. Multi-Feature Weighted Language Score Accumulator
  const scores = {
    python: 0,
    javascript: 0,
    typescript: 0,
    java: 0,
    c: 0,
    csharp: 0,
    go: 0,
    rust: 0,
    php: 0,
    ruby: 0,
    shell: 0,
    dockerfile: 0,
    yaml: 0,
    sql: 0
  };

  // Python Signatures
  if (/\b(def\s+[a-zA-Z0-9_]+\s*\(|import\s+os|import\s+sys|import\s+sqlite3|import\s+subprocess|import\s+hashlib|from\s+flask|from\s+django|elif\b|__name__\s*==|self\.|print\s*\(|True\b|False\b|None\b)/.test(trimmed)) scores.python += 5;
  if (/f["'].*?\{.*?\}/.test(trimmed)) scores.python += 3;
  if (/^\s*#\s+[a-zA-Z]/m.test(trimmed) && !trimmed.includes('#include')) scores.python += 2;

  // TypeScript Signatures
  if (/\b(interface\s+[A-Z]\w*|type\s+[A-Z]\w*\s*=|:\s*(string|number|boolean|any|void|unknown|never)\b|implements\s+|enum\s+[A-Z]\w*|as\s+[A-Z]\w*)/.test(trimmed)) scores.typescript += 6;

  // JavaScript / React Signatures
  if (/\b(const\s+|let\s+|var\s+|function\s+|require\s*\(|module\.exports|export\s+default|export\s+const|console\.log|process\.env|document\.|window\.|dangerouslySetInnerHTML|useEffect|useState)/.test(trimmed)) scores.javascript += 4;
  if (/=>\s*\{|=>\s*\(|</.test(trimmed)) scores.javascript += 2;

  // Java / Spring Signatures
  if (/\b(import\s+java\.|@RestController|@GetMapping|@PostMapping|@Autowired|System\.out\.print|DriverManager|PreparedStatement|ResultSet|throws\s+Exception)/.test(trimmed)) scores.java += 6;
  else if (/\b(public\s+class\s+|private\s+|protected\s+)/.test(trimmed) && !trimmed.includes('using System') && !trimmed.includes('namespace ')) scores.java += 4;

  // Go Signatures
  if (/\b(package\s+main|func\s+|r\.URL|http\.ResponseWriter|http\.Request|exec\.Command|fmt\.Print|go\s+func|chan\s+)/.test(trimmed)) scores.go += 5;
  if (/import\s*\(\s*"fmt"/.test(trimmed)) scores.go += 4;

  // C / C++ Signatures
  if (/#include\s*<[a-zA-Z0-9_\.]+|std::|cout\s*<<|cin\s*>>|printf\s*\(|sprintf\s*\(|strncpy\s*\(|malloc\s*\(|free\s*\(|int\s+main\s*\(/.test(trimmed)) scores.c += 5;

  // C# / .NET Signatures
  if (/\b(using\s+System|namespace\s+|Console\.Write|async\s+Task|IActionResult|\[HttpGet\]|\[HttpPost\])/.test(trimmed)) scores.csharp += 8;

  // Rust Signatures
  if (/\b(fn\s+main|let\s+mut\s+|println!|use\s+std::|impl\s+|pub\s+fn|Result<|Option<)/.test(trimmed)) scores.rust += 5;

  // PHP Signatures
  if (/\b(\$_GET|\$_POST|\$_REQUEST|\$this->|echo\s+|\$val|mysqli_|PDO::)/.test(trimmed)) scores.php += 5;

  // Ruby Signatures
  if (/\b(def\s+\w+|puts\s+|require\s+["']|class\s+\w+\s*<\s*|attr_accessor|do\s+\|)/.test(trimmed)) scores.ruby += 5;

  // Shell / Bash Signatures
  if (/\b(echo\s+|export\s+|sudo\s+|chmod\s+|grep\s+|awk\s+|sed\s+|fi\b|done\b)/.test(trimmed) && !trimmed.includes('console.log')) scores.shell += 3;

  // SQL Signatures (Pure SQL queries)
  if (/^\s*(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM|CREATE\s+TABLE|ALTER\s+TABLE)\b/i.test(trimmed) && !trimmed.includes('const') && !trimmed.includes('def') && !trimmed.includes('function')) scores.sql += 6;

  // Dockerfile Signatures
  if (/\b(WORKDIR|ENTRYPOINT|RUN\s+apt|RUN\s+npm|EXPOSE\s+[0-9]+|USER\s+[a-zA-Z0-9]+)\b/m.test(trimmed)) scores.dockerfile += 5;

  // YAML Signatures
  if (/^[a-zA-Z0-9_\-]+:\s+.*$/m.test(trimmed) && !trimmed.includes(';') && !trimmed.includes('{')) scores.yaml += 2;

  // Determine highest scoring language
  let bestLang = 'javascript';
  let maxScore = 0;

  Object.entries(scores).forEach(([lang, score]) => {
    if (score > maxScore) {
      maxScore = score;
      bestLang = lang;
    }
  });

  if (maxScore > 0) return bestLang;

  return 'javascript'; // Default fallback
}

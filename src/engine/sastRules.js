// Comprehensive SAST (Static Application Security Testing) Rules Database
// Aligned with OWASP Top 10 (2021) and MITRE CWE Framework

export const SAST_RULES = [
  // --- SQL INJECTION (CWE-89 / OWASP A03:2021) ---
  {
    id: "SEC-SQL-001",
    title: "SQL Injection via Dynamic String Concatenation / Interpolation",
    severity: "CRITICAL",
    cwe: "CWE-89",
    cweUrl: "https://cwe.mitre.org/data/definitions/89.html",
    owasp: "A03:2021 - Injection",
    languages: ["all"],
    pattern: /(f["'].*?\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\b|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|WHERE|FROM|SET)\b\s+.*(\+|\%|\$|\.format|f"|f'|`\$\{)|WHERE\s+.*`\$\{)/i,
    description: "Constructing SQL queries using dynamic string concatenation or string interpolation allows attackers to execute arbitrary SQL commands.",
    impact: "Full database compromise, unauthorized data exfiltration, deletion or modification of sensitive records.",
    remediation: "Use parameterized queries, prepared statements, or ORM parameter binding.",
    fixTemplate: (line) => line.replace(/(\+|\%|\.format|f"|f'|`\$\{.*?\}`)/g, "? /* use parameterized query */")
  },
  {
    id: "SEC-SQL-002",
    title: "Unescaped Raw SQL Query Execution",
    severity: "HIGH",
    cwe: "CWE-89",
    cweUrl: "https://cwe.mitre.org/data/definitions/89.html",
    owasp: "A03:2021 - Injection",
    languages: ["all"],
    pattern: /(db\.query|cursor\.execute|db\.execute|sequelize\.query|db\.raw|connection\.query|mysqli_query|pg_query)\s*\(\s*["'`f].*?(\+|\%|\{|\$)/i,
    description: "Passing dynamically constructed strings directly into database query execution methods.",
    impact: "Bypass authentication, read/modify database tables.",
    remediation: "Pass variables as an array or tuple of parameters separate from the SQL query template string."
  },
  {
    id: "SEC-SQL-003",
    title: "Generic SQL Statement String Concatenation",
    severity: "HIGH",
    cwe: "CWE-89",
    cweUrl: "https://cwe.mitre.org/data/definitions/89.html",
    owasp: "A03:2021 - Injection",
    languages: ["all"],
    pattern: /(query|sql|stmt|select_query)\s*[:=]+\s*["'].*?\b(SELECT|INSERT|UPDATE|DELETE|WHERE)\b(?![^"']*?\?)/i,
    description: "Assigning dynamically concatenated strings to a SQL query variable.",
    impact: "Unsanitized user input injection into database query stream.",
    remediation: "Use placeholders (e.g. `?` or `%s` or `$1`) and pass variables as parameterized query arguments."
  },
  {
    id: "SEC-SQL-004",
    title: "SQL Injection String Concatenation Fragment",
    severity: "HIGH",
    cwe: "CWE-89",
    cweUrl: "https://cwe.mitre.org/data/definitions/89.html",
    owasp: "A03:2021 - Injection",
    languages: ["all"],
    pattern: /^\s*\+\s*[a-zA-Z0-9_]+\s*\+\s*["']/i,
    description: "Concatenating dynamic variables into SQL string literal fragments allows SQL injection.",
    impact: "SQL Injection vulnerability.",
    remediation: "Consolidate into parameterized statements."
  },

  // --- HARDCODED SECRETS & CREDENTIALS (CWE-798 / OWASP A07:2021) ---
  {
    id: "SEC-SEC-001",
    title: "Hardcoded AWS Access Key or Secret",
    severity: "CRITICAL",
    cwe: "CWE-798",
    cweUrl: "https://cwe.mitre.org/data/definitions/798.html",
    owasp: "A07:2021 - Identification & Authentication Failures",
    languages: ["all"],
    pattern: /(AKIA[0-9A-Z]{16})|(ASIA[0-9A-Z]{16})|aws_secret_access_key\s*[:=]+\s*["'][A-Za-z0-9\/+=]{40}["']/i,
    description: "Hardcoded Amazon Web Services (AWS) credentials detected in source code.",
    impact: "Attackers can scrape repositories and gain complete control over cloud infrastructure.",
    remediation: "Store secrets in Environment Variables (.env) or secret managers like AWS Secrets Manager or Vault."
  },
  {
    id: "SEC-SEC-002",
    title: "Hardcoded API Key / Secret / Password",
    severity: "CRITICAL",
    cwe: "CWE-798",
    cweUrl: "https://cwe.mitre.org/data/definitions/798.html",
    owasp: "A07:2021 - Identification & Authentication Failures",
    languages: ["all"],
    pattern: /(secret|jwt_secret|private_key|token|api_key|apikey|password|passwd|auth_token|db_pass|access_key|slackToken)\s*[:=]+\s*["'](?!\$\{)[^"']{5,}["']/i,
    description: "Hardcoded authentication key, API key, or password in application source file.",
    impact: "Forged user authentication tokens, unauthorized API impersonation.",
    remediation: "Use `process.env.SECRET_KEY` or `os.environ.get('SECRET_KEY')`."
  },
  {
    id: "SEC-SEC-003",
    title: "Hardcoded High-Entropy API Token (Google / OpenAI / GitHub / Slack)",
    severity: "HIGH",
    cwe: "CWE-798",
    cweUrl: "https://cwe.mitre.org/data/definitions/798.html",
    owasp: "A07:2021 - Identification & Authentication Failures",
    languages: ["all"],
    pattern: /(AIzaSy[A-Za-z0-9_\-]{33}|ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}|sk_live_[0-9a-zA-Z]{16,36}|sk-proj-[A-Za-z0-9_-]{15,}|sk-[A-Za-z0-9_-]{20,}|xox[baprs]-[0-9a-zA-Z]{10,48})/i,
    description: "Google Cloud API Key, GitHub Token, OpenAI Key, Stripe Key, or Slack Token exposed in code.",
    impact: "Unauthorized third-party API access and cloud resource manipulation.",
    remediation: "Revoke key immediately and migrate to secure environment variables."
  },

  // --- CROSS-SITE SCRIPTING (XSS) (CWE-79 / OWASP A03:2021) ---
  {
    id: "SEC-XSS-001",
    title: "Reflected / DOM XSS via dangerous innerHTML or document.write",
    severity: "HIGH",
    cwe: "CWE-79",
    cweUrl: "https://cwe.mitre.org/data/definitions/79.html",
    owasp: "A03:2021 - Injection",
    languages: ["all"],
    pattern: /(dangerouslySetInnerHTML|innerHTML\s*=|document\.write\s*\(|document\.writeln\s*\(|userProvidedMarkup|res\.send\s*\([^)]*<.*?\+|res\.send\s*\([^)]*req\.(query|body|params)|res\.write\s*\([^)]*<.*?\+)/i,
    description: "Directly writing untrusted raw HTML or user input into DOM elements causes Cross-Site Scripting (XSS).",
    impact: "Session hijacking, credential theft, malicious script execution in victim browser context.",
    remediation: "Use React default text rendering `{text}`, or sanitize HTML using `DOMPurify.sanitize()`."
  },
  {
    id: "SEC-XSS-002",
    title: "Unescaped Template Output in HTML",
    severity: "MEDIUM",
    cwe: "CWE-79",
    cweUrl: "https://cwe.mitre.org/data/definitions/79.html",
    owasp: "A03:2021 - Injection",
    languages: ["all"],
    pattern: /(\{\{\s*.*?\s*\|safe\s*\}\}|\<%=\s*raw|v-html|render_template_string)/i,
    description: "Template engine explicit bypass of auto-escaping mechanism.",
    impact: "Cross-site scripting via unescaped dynamic payload.",
    remediation: "Remove `safe` or `raw` flags unless input is strictly validated with an HTML sanitizer."
  },

  // --- COMMAND INJECTION & RCE (CWE-78 / OWASP A03:2021) ---
  {
    id: "SEC-RCE-001",
    title: "Command Injection via Unsanitized Shell Execution",
    severity: "CRITICAL",
    cwe: "CWE-78",
    cweUrl: "https://cwe.mitre.org/data/definitions/78.html",
    owasp: "A03:2021 - Injection",
    languages: ["all"],
    pattern: /(\bexec\.Command\s*\(\s*["'](sh|bash)["']|execSync\s*\(|spawn\s*\([^)]*shell\s*:\s*true|exec\s*\([^)]*(\+|\$|%|f"|f')|os\.system\s*\(|subprocess\.(Popen|call|run|check_output)\s*\([^)]*shell\s*=\s*True|subprocess\.(Popen|call|run|check_output)\s*\(\s*f?["'][^"']*\%|\bsystem\s*\(\s*[^)]+|\bProcess\.Start\s*\()/i,
    description: "Executing system shell commands with concatenated dynamic input enables Remote Code Execution (RCE).",
    impact: "Complete operating system take-over, reverse shell access, privilege escalation.",
    remediation: "Avoid invoking system shell. Use safe APIs (e.g. `execFile` or `subprocess.run(['cmd', arg1])` without `shell=True`)."
  },
  {
    id: "SEC-EXPOSE-001",
    title: "Sensitive Information Exposure via Standard Output",
    severity: "MEDIUM",
    cwe: "CWE-532",
    cweUrl: "https://cwe.mitre.org/data/definitions/532.html",
    owasp: "A09:2021 - Security Logging and Monitoring Failures",
    languages: ["all"],
    pattern: /(cout\s*<<\s*.*<<\s*(API_KEY|SECRET|PASSWORD|TOKEN)\b|System\.out\.print.*(Password|API_KEY|SECRET)|print\(.*(api_key|secret|password))/i,
    description: "Printing secret credentials or authentication tokens to standard output streams.",
    impact: "Exposing secrets in application log files or stdout buffer.",
    remediation: "Avoid printing plain-text secrets to output logs."
  },
  {
    id: "SEC-RCE-002",
    title: "Dynamic Code Evaluation (eval / Function)",
    severity: "CRITICAL",
    cwe: "CWE-95",
    cweUrl: "https://cwe.mitre.org/data/definitions/95.html",
    owasp: "A03:2021 - Injection",
    languages: ["all"],
    pattern: /\beval\s*\(|new\s+Function\s*\(/i,
    description: "Evaluating arbitrary code dynamically using `eval()` or dynamic `Function()` constructor.",
    impact: "Arbitrary code execution within application environment context.",
    remediation: "Refactor logic to standard JSON parsing (`JSON.parse`) or structured lookups instead of dynamic code execution."
  },

  // --- PATH TRAVERSAL (CWE-22 / OWASP A01:2021) ---
  {
    id: "SEC-PATH-001",
    title: "Path Traversal in File System Operations",
    severity: "HIGH",
    cwe: "CWE-22",
    cweUrl: "https://cwe.mitre.org/data/definitions/22.html",
    owasp: "A01:2021 - Broken Access Control",
    languages: ["all"],
    pattern: /(fs\.readFile|fs\.readFileSync|\bopen\b|\bFile\b|\bfopen\b|\breadfile\b|tarfile\.open|extractall)\s*\(\s*.*(\+|\$\{|\breq|\brequest|\buser_input|\binput_|\bfile_path|\bpath|\bfile|\btarget|\bdest|\bself\.|\bfn)/i,
    description: "Accessing file system paths directly using HTTP request parameters or user inputs without sanitization.",
    impact: "Reading arbitrary system files such as `/etc/passwd` or application config files.",
    remediation: "Validate inputs against strict whitelists, use `path.basename()`, or resolve absolute paths with strict base directory validation."
  },

  // --- INSECURE DESERIALIZATION (CWE-502 / OWASP A08:2021) ---
  {
    id: "SEC-DESER-001",
    title: "Insecure Object Deserialization",
    severity: "CRITICAL",
    cwe: "CWE-502",
    cweUrl: "https://cwe.mitre.org/data/definitions/502.html",
    owasp: "A08:2021 - Software and Data Integrity Failures",
    languages: ["all"],
    pattern: /(pickle\.loads|pickle\.load|yaml\.load\s*\([^,)]*\)|unserialize\s*\(|ObjectInputStream|BinaryFormatter.*Deserialize)/i,
    description: "Deserializing untrusted data stream into live objects without type validation.",
    impact: "Arbitrary remote code execution via gadget chain execution.",
    remediation: "Use safe data serialization formats like JSON, or use `yaml.safe_load()` in Python."
  },

  // --- INSECURE CRYPTOGRAPHY & AUTH (CWE-327 / OWASP A02:2021) ---
  {
    id: "SEC-CRYPTO-001",
    title: "Weak Password Hashing Algorithm (MD5 / SHA1)",
    severity: "MEDIUM",
    cwe: "CWE-327",
    cweUrl: "https://cwe.mitre.org/data/definitions/327.html",
    owasp: "A02:2021 - Cryptographic Failures",
    languages: ["all"],
    pattern: /(crypto\.createHash\s*\(\s*["'](md5|sha1)["']|hashlib\.md5|hashlib\.sha1|DigestUtils\.md5|md5\s*\(|(hashlib\.sha256|crypto\.createHash\s*\(\s*["']sha256["']\))\s*\([^)]*pass)/i,
    description: "MD5 and SHA-1 are unsuitable for password storage because they are fast, general-purpose hash functions providing insufficient work-factor resistance against password-guessing attacks.",
    impact: "Fast rainbow table attacks allowing password cracking.",
    remediation: "Use Argon2id, bcrypt, or PBKDF2 with high iteration counts for password storage."
  },
  {
    id: "SEC-AUTH-002",
    title: "Insecure Plaintext Password Comparison",
    severity: "HIGH",
    cwe: "CWE-256",
    cweUrl: "https://cwe.mitre.org/data/definitions/256.html",
    owasp: "A07:2021 - Identification & Authentication Failures",
    languages: ["all"],
    pattern: /(user|account|db|stored|userObj)\.password\s*===?\s*(req\.|request\.|input|body|params|password|pass|inputPassword)|(password|pass|inputPassword)\s*===?\s*(user|account|db|stored|userObj)\.password/i,
    description: "Comparing user passwords directly using plaintext string comparison (`===` or `==`) instead of secure hash verification (e.g. `bcrypt.compare` or `argon2.verify`).",
    impact: "Exposes raw passwords in memory and timing attack vulnerabilities.",
    remediation: "Use `bcrypt.compare(req.body.password, user.passwordHash)` or `argon2.verify()` for password validation."
  },

  // --- SERVER-SIDE REQUEST FORGERY (SSRF) (CWE-918 / OWASP A10:2021) ---
  {
    id: "SEC-SSRF-001",
    title: "Server-Side Request Forgery (SSRF)",
    severity: "HIGH",
    cwe: "CWE-918",
    cweUrl: "https://cwe.mitre.org/data/definitions/918.html",
    owasp: "A10:2021 - Server-Side Request Forgery",
    languages: ["all"],
    pattern: /(axios\.(get|post|request)|fetch\s*\(|requests\.(get|post)|http\.Get|HttpClient|file_get_contents|curl_exec)\s*\(\s*.*(req\.query|req\.body|user_url|input_url|url|target|endpoint|uri|link|dest)/i,
    description: "Fetching remote URLs directly provided by users without IP/host whitelisting.",
    impact: "Accessing internal cloud metadata endpoints (`http://169.254.169.254`), scanning internal subnets.",
    remediation: "Validate destination URLs against an explicit IP whitelist and block private IP ranges (10.0.0.0/8, 127.0.0.1, 169.254.0.0/16)."
  },

  // --- DANGEROUS C / C++ FUNCTIONS (CWE-676 / CWE-120) ---
  {
    id: "SEC-C-001",
    title: "Use of Potentially Dangerous Function (gets / strcpy / sprintf)",
    severity: "HIGH",
    cwe: "CWE-676",
    cweUrl: "https://cwe.mitre.org/data/definitions/676.html",
    owasp: "A06:2021 - Vulnerable and Outdated Components",
    languages: ["all"],
    pattern: /\b(gets|strcpy|strcat|sprintf)\s*\(/i,
    description: "Using unbounded buffer copy or string format functions causes buffer overflow vulnerabilities.",
    impact: "Memory corruption, execution hijack, crash.",
    remediation: "Use safe bounded alternatives like `fgets()`, `strncpy()`, `snprintf()`."
  },

  // --- DOCKER SECURITY MISCONFIGURATIONS ---
  {
    id: "SEC-DOCKER-001",
    title: "Dockerfile Running as Root User",
    severity: "HIGH",
    cwe: "CWE-250",
    cweUrl: "https://cwe.mitre.org/data/definitions/250.html",
    owasp: "A05:2021 - Security Misconfiguration",
    languages: ["dockerfile"],
    pattern: /^\s*USER\s+root$/i,
    description: "Container runs process as superuser `root`.",
    impact: "Container breakout vulnerabilities allow privilege escalation on host OS.",
    remediation: "Add `USER node` or create non-privileged app user `RUN useradd -m appuser && USER appuser`."
  },
  {
    id: "SEC-DOCKER-002",
    title: "Exposed API Secret in Docker ENV",
    severity: "CRITICAL",
    cwe: "CWE-798",
    cweUrl: "https://cwe.mitre.org/data/definitions/798.html",
    owasp: "A05:2021 - Security Misconfiguration",
    languages: ["dockerfile"],
    pattern: /ENV\s+(.*KEY|.*SECRET|.*PASSWORD|.*TOKEN)\s*=\s*["']?[A-Za-z0-9_-]{8,}["']?/i,
    description: "Hardcoding secrets in Docker ENV instructions leaves secrets permanently baked into image metadata history.",
    impact: "Anyone pulling the docker image can extract secrets via `docker inspect`.",
    remediation: "Inject credentials dynamically at runtime using secret mounts (`--secret`) or environment variables."
  },

  // --- XML EXTERNAL ENTITY (XXE) (CWE-611 / OWASP A05:2021) ---
  {
    id: "SEC-XXE-001",
    title: "XML External Entity (XXE) Injection",
    severity: "HIGH",
    cwe: "CWE-611",
    cweUrl: "https://cwe.mitre.org/data/definitions/611.html",
    owasp: "A05:2021 - Security Misconfiguration",
    languages: ["all"],
    pattern: /(DocumentBuilderFactory|XMLInputFactory|SAXParserFactory|xml\.etree\.ElementTree|\bDOMParser\b|\bparseXML\b|xml\.parse)/i,
    description: "Parsing XML input without disabling external entity resolution allows local file disclosure.",
    impact: "Arbitrary file read (/etc/passwd), SSRF attacks, denial of service.",
    remediation: "Disable DTDs and external entity processing (`setFeature(\"http://xml.org/sax/features/external-general-entities\", false)`)."
  },

  // --- SERVER-SIDE TEMPLATE INJECTION (SSTI) (CWE-94 / OWASP A03:2021) ---
  {
    id: "SEC-SSTI-001",
    title: "Server-Side Template Injection (SSTI)",
    severity: "HIGH",
    cwe: "CWE-94",
    cweUrl: "https://cwe.mitre.org/data/definitions/94.html",
    owasp: "A03:2021 - Injection",
    languages: ["all"],
    pattern: /(render_template_string|jinja2\.Template|Handlebars\.compile|ejs\.render)\s*\(\s*.*(\+|\$|\%)/i,
    description: "Passing dynamic user input directly into template string rendering engines.",
    impact: "Remote Code Execution (RCE) on server host.",
    remediation: "Use static template files and pass dynamic variables via context objects."
  },

  // --- INSECURE CORS / JWT CONFIGURATION (CWE-347 / CWE-942) ---
  {
    id: "SEC-CORS-001",
    title: "Overly Permissive CORS Policy (Access-Control-Allow-Origin: *)",
    severity: "MEDIUM",
    cwe: "CWE-942",
    cweUrl: "https://cwe.mitre.org/data/definitions/942.html",
    owasp: "A05:2021 - Security Misconfiguration",
    languages: ["all"],
    pattern: /(Access-Control-Allow-Origin\s*:\s*\*|cors\s*\(\s*\{\s*origin\s*:\s*["']\*["'])/i,
    description: "Allowing wildcard origins (`*`) in CORS headers with authenticated APIs.",
    impact: "Cross-domain data leakage to malicious websites.",
    remediation: "Specify explicit trusted origin domains instead of wildcard `*`."
  },

  // --- PHP SPECIFIC SECURITY RULES ---
  {
    id: "SEC-PHP-001",
    title: "Dangerous PHP Code / Command Execution (eval / shell_exec / passthru)",
    severity: "CRITICAL",
    cwe: "CWE-95",
    cweUrl: "https://cwe.mitre.org/data/definitions/95.html",
    owasp: "A03:2021 - Injection",
    languages: ["php"],
    pattern: /\b(eval|shell_exec|passthru|popen|proc_open)\s*\(\s*(\$_|\$)/i,
    description: "Passing user input directly into PHP dynamic code or command execution functions.",
    impact: "Remote Code Execution (RCE) on web server.",
    remediation: "Avoid dynamic execution. Use parameterized functions or strict whitelists."
  },
  {
    id: "SEC-PHP-002",
    title: "Unsanitized File Inclusion (Remote / Local File Inclusion)",
    severity: "HIGH",
    cwe: "CWE-98",
    cweUrl: "https://cwe.mitre.org/data/definitions/98.html",
    owasp: "A03:2021 - Injection",
    languages: ["php"],
    pattern: /\b(include|require|include_once|require_once)\s*\(\s*.*(\$_GET|\$_POST|\$_REQUEST|\$user_)/i,
    description: "Including PHP files using unvalidated request parameter values.",
    impact: "Local File Inclusion (LFI) or Remote File Inclusion (RFI) allowing arbitrary code execution.",
    remediation: "Use hardcoded file mappings or strict basename validation."
  },

  // --- C# / .NET SECURITY RULES ---
  {
    id: "SEC-CS-001",
    title: "Unsanitized Process Execution in .NET",
    severity: "CRITICAL",
    cwe: "CWE-78",
    cweUrl: "https://cwe.mitre.org/data/definitions/78.html",
    owasp: "A03:2021 - Injection",
    languages: ["csharp"],
    pattern: /\bProcess\.Start\s*\(\s*.*(\+|string\.Format|\$")/i,
    description: "Starting system processes using dynamically concatenated command arguments.",
    impact: "Command Injection in Windows / Linux environment.",
    remediation: "Use `ProcessStartInfo.ArgumentList` instead of raw string command line arguments."
  },
  {
    id: "SEC-CS-002",
    title: "Insecure BinaryFormatter Deserialization in .NET",
    severity: "CRITICAL",
    cwe: "CWE-502",
    cweUrl: "https://cwe.mitre.org/data/definitions/502.html",
    owasp: "A08:2021 - Software and Data Integrity Failures",
    languages: ["csharp"],
    pattern: /\bBinaryFormatter\b.*\.Deserialize\s*\(/i,
    description: "BinaryFormatter is inherently dangerous and vulnerable to remote code execution deserialization attacks.",
    impact: "Remote code execution during data payload deserialization.",
    remediation: "Replace `BinaryFormatter` with `System.Text.Json` or `XmlSerializer`."
  },

  // --- RUBY & RAILS SECURITY RULES ---
  {
    id: "SEC-RB-001",
    title: "Insecure Dynamic Method / Code Execution in Ruby",
    severity: "CRITICAL",
    cwe: "CWE-95",
    cweUrl: "https://cwe.mitre.org/data/definitions/95.html",
    owasp: "A03:2021 - Injection",
    languages: ["ruby"],
    pattern: /\b(eval|send|public_send)\s*\(\s*.*(params\[|request\.|user_)/i,
    description: "Passing user-controlled HTTP parameters directly to Ruby `eval` or dynamic `send` calls.",
    impact: "Remote Code Execution (RCE) on Rails application server.",
    remediation: "Use strict case/switch statement maps instead of dynamic method invocation."
  },

  // --- RUST SECURITY RULES ---
  {
    id: "SEC-RS-001",
    title: "Misuse of Unsafe Memory Block in Rust",
    severity: "HIGH",
    cwe: "CWE-119",
    cweUrl: "https://cwe.mitre.org/data/definitions/119.html",
    owasp: "A06:2021 - Vulnerable and Outdated Components",
    languages: ["rust"],
    pattern: /\bunsafe\s*\{/i,
    description: "`unsafe` blocks bypass Rust's memory safety guarantees.",
    impact: "Use-after-free, memory corruption, data races, buffer overflow.",
    remediation: "Minimize `unsafe` blocks and encapsulate safety invariants using safe abstractions."
  },

  // --- SHELL / BASH SECURITY RULES ---
  {
    id: "SEC-SH-001",
    title: "Pipe to Shell Command Execution (curl / wget | bash)",
    severity: "CRITICAL",
    cwe: "CWE-78",
    cweUrl: "https://cwe.mitre.org/data/definitions/78.html",
    owasp: "A03:2021 - Injection",
    languages: ["all"],
    pattern: /(curl|wget)\s+.*?\|\s*(bash|sh|zsh)/i,
    description: "Piping untrusted remote scripts directly into a shell interpreter.",
    impact: "Immediate remote code execution if domain is compromised or MITM occurs.",
    remediation: "Download script, verify SHA256 checksum, and inspect content prior to execution."
  },

  // --- KUBERNETES & YAML SECURITY RULES ---
  {
    id: "SEC-K8S-001",
    title: "Privileged Pod Container Misconfiguration in Kubernetes",
    severity: "HIGH",
    cwe: "CWE-250",
    cweUrl: "https://cwe.mitre.org/data/definitions/250.html",
    owasp: "A05:2021 - Security Misconfiguration",
    languages: ["yaml"],
    pattern: /(privileged\s*:\s*true|hostNetwork\s*:\s*true|hostPID\s*:\s*true)/i,
    description: "Kubernetes pod is configured with root `privileged` mode or host namespace access.",
    impact: "Container breakout to underlying Kubernetes worker node host.",
    remediation: "Set `privileged: false` and enforce Pod Security Admission standards."
  },

  // --- CROSS-SITE SCRIPTING (XSS) (CWE-79 / OWASP A03:2021) ---
  {
    id: "SEC-XSS-001",
    title: "Reflected / DOM Cross-Site Scripting (XSS)",
    severity: "HIGH",
    cwe: "CWE-79",
    cweUrl: "https://cwe.mitre.org/data/definitions/79.html",
    owasp: "A03:2021 - Injection",
    languages: ["all"],
    pattern: /(innerHTML|outerHTML|document\.write|insertAdjacentHTML|dangerouslySetInnerHTML|res\.send\s*\(\s*["'`<]|render_template_string|echo\s+\$_GET|\$response->write)\s*[\(=]/i,
    description: "Rendering untrusted user input directly into HTML output or DOM sinks without escaping.",
    impact: "Execution of arbitrary JavaScript in user browser session.",
    remediation: "Use contextual HTML entity encoding or DOMPurify.sanitize()."
  },

  // --- PRIVILEGE ELEVATION (CWE-250 / OWASP A04:2021) ---
  {
    id: "SEC-PRIV-001",
    title: "Execution with Unnecessary Root Privileges",
    severity: "HIGH",
    cwe: "CWE-250",
    cweUrl: "https://cwe.mitre.org/data/definitions/250.html",
    owasp: "A04:2021 - Insecure Design",
    languages: ["all"],
    pattern: /\b(os\.setuid|os\.setgid|setuid|setgid|seteuid|setegid)\s*\(\s*0\s*\)/i,
    description: "Explicitly elevating process execution context to root (UID/GID 0).",
    impact: "Privilege escalation and full operating system compromise.",
    remediation: "Follow the principle of least privilege. Avoid dropping to UID 0."
  },

  // --- WEAK CRYPTOGRAPHY (CWE-327 / OWASP A02:2021) ---
  {
    id: "SEC-CRYPTO-001",
    title: "Use of Weak Cryptographic Hash Algorithm",
    severity: "MEDIUM",
    cwe: "CWE-327",
    cweUrl: "https://cwe.mitre.org/data/definitions/327.html",
    owasp: "A02:2021 - Cryptographic Failures",
    languages: ["all"],
    pattern: /\b(hashlib\.md5|hashlib\.sha1|Digest::MD5|Digest::SHA1|MD5\.Create|SHA1\.Create|crypto\.createHash\s*\(\s*["'](md5|sha1)["']\)|MessageDigest\.getInstance\s*\(\s*["'](MD5|SHA-1)["']\)|hashlib\.new\s*\(\s*["'](md5|sha1)["']\))\b/i,
    description: "Using broken cryptographic hashing algorithms like MD5 or SHA-1.",
    impact: "Collision attacks, preimage attacks, and password hashing compromise.",
    remediation: "Use modern secure hash algorithms such as SHA-256 or bcrypt/argon2."
  },

  // --- IDOR / BOLA BROKEN ACCESS CONTROL (CWE-639 / OWASP A01:2021) ---
  {
    id: "SEC-AUTH-001",
    title: "Insecure Direct Object Reference (IDOR / BOLA)",
    severity: "HIGH",
    cwe: "CWE-639",
    cweUrl: "https://cwe.mitre.org/data/definitions/639.html",
    owasp: "A01:2021 - Broken Access Control",
    languages: ["all"],
    pattern: /\b(SELECT|DELETE|UPDATE)\b.*?WHERE\s+id\s*=\s*(req\.|request\.|params|args)/i,
    description: "Directly referencing database record identifiers from HTTP parameters without verifying session ownership.",
    impact: "Unauthorized data disclosure, modification, or deletion across user accounts.",
    remediation: "Enforce session-bound ownership validation (e.g. `WHERE id = ? AND user_id = ?`)."
  },

  // --- DOCKERFILE / CONTAINER SECURITY (CWE-250 / OWASP A05:2021) ---
  {
    id: "SEC-DOCKER-001",
    title: "Container Running as Root User",
    severity: "MEDIUM",
    cwe: "CWE-250",
    cweUrl: "https://cwe.mitre.org/data/definitions/250.html",
    owasp: "A05:2021 - Security Misconfiguration",
    languages: ["dockerfile"],
    pattern: /^USER\s+root$/im,
    description: "Configuring container execution context to run as privileged root user.",
    impact: "Container escape and host system compromise.",
    remediation: "Specify a non-root USER instruction in Dockerfile (e.g. `USER node` or `USER appuser`)."
  },

  // --- IAC TERRAFORM / CLOUD SECURITY (CWE-732 / OWASP A05:2021) ---
  {
    id: "SEC-IAC-001",
    title: "Overly Permissive Ingress Security Group (0.0.0.0/0)",
    severity: "HIGH",
    cwe: "CWE-732",
    cweUrl: "https://cwe.mitre.org/data/definitions/732.html",
    owasp: "A05:2021 - Security Misconfiguration",
    languages: ["yaml", "terraform"],
    pattern: /cidr_blocks\s*=\s*\[\s*["']0\.0\.0\.0\/0["']\s*\]/i,
    description: "Exposing network ingress rules to the entire public Internet (0.0.0.0/0).",
    impact: "Unrestricted network exposure allowing brute-force or exploitation from arbitrary hosts.",
    remediation: "Restrict ingress CIDR blocks to specific trusted IP ranges or security groups."
  }
];

export const OWASP_CATEGORIES = [
  "A01:2021 - Broken Access Control",
  "A02:2021 - Cryptographic Failures",
  "A03:2021 - Injection",
  "A04:2021 - Insecure Design",
  "A05:2021 - Security Misconfiguration",
  "A06:2021 - Vulnerable and Outdated Components",
  "A07:2021 - Identification & Authentication Failures",
  "A08:2021 - Software and Data Integrity Failures",
  "A09:2021 - Security Logging & Monitoring Failures",
  "A10:2021 - Server-Side Request Forgery"
];


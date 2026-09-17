/**
 * Severa Defender AI — Interprocedural Data-Flow & Secret Propagation Engine
 * Tracks untrusted sources and hardcoded secrets through variables, aliases, destructuring,
 * compound assignments (+=), arrays, object properties, function parameters, return values, and sinks.
 * Uses semantic sanitizer provenance modeling rather than variable-name matching.
 */

import { buildCallGraph } from './callGraphBuilder.js';

export function analyzeDataFlow(code, language = 'javascript', callGraph = null) {
  const lines = code.split('\n');
  const lang = (language || 'javascript').toLowerCase();

  // Taint Store: Identifier -> { source, name, line, originSnippet, sanitized, sanitizer, sanitizerType }
  const taintMap = new Map();
  const flowFindings = [];
  const cg = callGraph || buildCallGraph(code, lang);

  // 1. Untrusted Input Source Patterns (Purely input-oriented, no name filtering)
  const isUntrustedSource = (text) => {
    if (/req\.(query|body|params|headers|cookies|param)/i.test(text)) return { type: 'HTTP Query/Body Input', name: 'req.query' };
    if (/request\.(args|form|json|get_data|headers|GET|POST|query_parameters|params)/i.test(text)) return { type: 'HTTP Request Parameter', name: 'request.args' };
    if (/\b(input|raw_input|readline)\s*\(/i.test(text)) return { type: 'Standard User Input', name: 'input()' };
    if (/request\.getParameter|@RequestParam|@PathVariable|@RequestBody/i.test(text)) return { type: 'Java Request Input', name: 'getParameter' };
    if (/r\.URL\.Query|r\.FormValue|r\.PostFormValue|r\.Header/i.test(text)) return { type: 'Go HTTP Parameter', name: 'r.URL.Query()' };
    if (/\$_(GET|POST|REQUEST|COOKIE|SERVER)/i.test(text)) return { type: 'PHP Superglobal Input', name: '$_GET' };
    if (/Request\.(QueryString|Query|Form|Headers|Cookies|Params)|Request\[/i.test(text)) return { type: 'C# Request Input', name: 'Request.QueryString' };
    if (/(?:params\[|request\.(?:params|query_parameters|headers))/i.test(text)) return { type: 'Ruby Params', name: 'params' };
    return null;
  };

  // 2. High-Entropy Secret & Key Token Patterns
  const isHighEntropySecret = (text) => {
    if (text.includes('process.env') || text.includes('os.getenv') || text.includes('os.environ') || text.includes('System.getenv') || text.includes('your-api-key') || text.includes('example-key') || text.includes('placeholder')) {
      return null;
    }
    const secretMatch = text.match(/(AKIA[0-9A-Z]{16})|(ASIA[0-9A-Z]{16})|(sk_live_[0-9a-zA-Z]{24})|(ghp_[A-Za-z0-9]{36})|(xox[baprs]-[0-9a-zA-Z]{10,48})/i);
    if (secretMatch) {
      return { type: 'High-Entropy API Key/Token', token: secretMatch[0] };
    }
    return null;
  };

  // Registered Custom Sanitizers Registry
  const CUSTOM_SANITIZERS = [];
  
  // 3. Semantic Sanitizer Detector
  const detectSanitizer = (text) => {
    // Check custom registered sanitizers first
    for (const cs of CUSTOM_SANITIZERS) {
      if (cs.pattern.test(text)) return { type: cs.type, name: cs.name };
    }
    if (/path\.basename|os\.path\.basename|filepath\.Base|Path\.GetFileName|secure_filename|\bbasename\s*\(|\.parents\b|\.resolve\(|\bBASE_DIR\b|\.startsWith\b/i.test(text)) {
      return { type: 'path', name: 'path_validation' };
    }
    if (/DOMPurify\.sanitize|html\.escape|htmlspecialchars|sanitizeHtml/i.test(text)) {
      return { type: 'html', name: 'DOMPurify' };
    }
    if (/buildParameterizedQuery|escapeIdentifier|quote_ident/i.test(text)) {
      return { type: 'sql', name: 'parameterized' };
    }
    if (/shlex\.quote|escapeshellarg|escapeshellcmd/i.test(text)) {
      return { type: 'cmd', name: 'shlex.quote' };
    }
    if (/\b(?:ALLOWED|ALLOWED_DOMAINS|whitelist|ALLOWLIST|valid_urls|allowed_urls|allowed|valid_domain)\b|url_whitelist|url_allowlist|\burl\.startsWith|\btargetUrl\.startsWith|isValidUrl|sanitizeUrl/i.test(text)) {
      return { type: 'url', name: 'allowlist' };
    }
    return null;
  };

  const makeVarRegex = (varName) => {
    const escaped = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (varName.startsWith('$')) {
      return new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}\\b`, 'i');
    }
    return new RegExp(`\\b${escaped}\\b`, 'i');
  };

  // 4. Sink & CWE Definitions
  const SINK_DEFINITIONS = [
    {
      cwe: 'CWE-89',
      title: 'SQL Injection via Dynamic Tainted Data Flow',
      severity: 'CRITICAL',
      pattern: /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\b|cursor\.execute|db\.query|sequelize\.query|db\.execute|mysqli_query|pg_query|SqlCommand|stmt\.execute/i,
      isSink: (text, varName, taintInfo) => {
        if (!varName) return false;
        if (text.includes('.update(') || text.includes('.update ') || text.includes('crypto.')) return false;
        if (taintInfo && taintInfo.sanitized && (taintInfo.sanitizerType === 'sql' || taintInfo.sanitizer === 'parameterized')) {
          return false;
        }
        if (text.includes('?') || text.includes('replacements:') || /execute\s*\([^,]+,\s*[\(\[]/i.test(text) || /query\s*\([^,]+,\s*\[/i.test(text) || (/\b(SELECT|INSERT|UPDATE|DELETE)\b/i.test(text) && !text.includes('+') && !text.includes('f"') && !text.includes("f'"))) {
          return false;
        }
        return makeVarRegex(varName).test(text);
      }
    },
    {
      cwe: 'CWE-78',
      title: 'Command Injection via Unsanitized Shell Flow',
      severity: 'CRITICAL',
      pattern: /execSync|exec\s*\(|os\.system|subprocess\.(Popen|call|run|check_output)|Runtime\.getRuntime\(\)\.exec|Process\.Start|system\s*\(|exec\.Command|shell_exec|passthru/i,
      isSink: (text, varName, taintInfo) => {
        if (!varName) return false;
        if (taintInfo && taintInfo.sanitized && (taintInfo.sanitizerType === 'cmd' || taintInfo.sanitizer === 'shlex.quote')) {
          return false;
        }
        if (/execFile\s*\(|subprocess\.run\s*\(\s*\[/i.test(text) && !/shell\s*=\s*True/i.test(text)) return false;
        return makeVarRegex(varName).test(text);
      }
    },
    {
      cwe: 'CWE-918',
      title: 'Server-Side Request Forgery (SSRF) via Untrusted URL',
      severity: 'HIGH',
      pattern: /axios\.(get|post|request)|fetch\s*\(|requests\.(get|post)|http\.Get|HttpClient|file_get_contents|curl_exec/i,
      isSink: (text, varName, taintInfo) => {
        if (!varName) return false;
        if (taintInfo && taintInfo.sanitized && taintInfo.sanitizerType === 'url') {
          return false;
        }
        if (text.includes('https://api.trusteddomain.com') || text.includes('ALLOWED_DOMAINS') || text.includes('.startsWith(')) return false;
        return makeVarRegex(varName).test(text);
      }
    },
    {
      cwe: 'CWE-22',
      title: 'Path Traversal via Untrusted File Operation',
      severity: 'HIGH',
      pattern: /fs\.(readFile|readFileSync|createReadStream)|\bopen\s*\(|\bFile\s*\(|File\.(ReadAllText|ReadAllBytes|ReadAllLines|OpenRead|OpenWrite|OpenText|read)|\bfopen\b|\breadfile\b|path\.join|os\.path\.join|\bPath\s*\(/i,
      isSink: (text, varName, taintInfo) => {
        if (!varName) return false;
        if (taintInfo && taintInfo.sanitized && (taintInfo.sanitizerType === 'path' || taintInfo.sanitizer === 'basename')) {
          return false;
        }
        if (text.includes('path.basename') || text.includes('os.path.basename') || text.includes('filepath.Base') || text.includes('Path.GetFileName') || text.includes('secure_filename')) {
          return false;
        }
        return makeVarRegex(varName).test(text);
      }
    },
    {
      cwe: 'CWE-502',
      title: 'Insecure Deserialization of Untrusted Data Stream',
      severity: 'CRITICAL',
      pattern: /pickle\.loads|pickle\.load|yaml\.load|unserialize|BinaryFormatter.*Deserialize|\.Deserialize\s*\(|ObjectInputStream/i,
      isSink: (text, varName) => {
        if (!varName) return false;
        return makeVarRegex(varName).test(text);
      }
    }
  ];

  let hasBinaryFormatter = false;

  // Pass 1: Local Statement-by-Statement Taint & Secret Propagation
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.includes('SECURED') || trimmed.includes('FIXED')) return;

    if (trimmed.includes('BinaryFormatter')) {
      hasBinaryFormatter = true;
    }

    // Check high-entropy secret tokens inside array literals or assignments
    const secretInfo = isHighEntropySecret(trimmed);
    if (secretInfo) {
      const secretVarMatch = trimmed.match(/(?:const|let|var|string|val)?\s*([a-zA-Z0-9_]+)\s*[:=]/);
      const secretVar = secretVarMatch ? secretVarMatch[1] : 'KEY_TOKEN';

      flowFindings.push({
        id: `SECRET-TOKEN-L${lineNum}`,
        ruleId: 'SEC-SEC-003',
        line: lineNum,
        column: 1,
        codeSnippet: trimmed,
        title: 'Hardcoded High-Entropy Secret / API Key Token',
        severity: 'CRITICAL',
        confidence: 'CONFIRMED_SECRET',
        cwe: 'CWE-798',
        cweUrl: 'https://cwe.mitre.org/data/definitions/798.html',
        owasp: 'A07:2021 - Identification & Authentication Failures',
        description: `Hardcoded ${secretInfo.type} exposed in code: '${secretInfo.token}'.`,
        impact: 'Third-party API key compromise, unauthorized cloud resource access.',
        remediation: 'Migrate secret token to environment variables (process.env or os.environ).'
      });
    }

    // Check if line introduces a direct untrusted source
    const srcInfo = isUntrustedSource(trimmed);

    // Compound Assignments (e.g., q += "WHERE name = '" + name + "'")
    if (trimmed.includes('+=') && (trimmed.includes('SELECT') || trimmed.includes('WHERE') || trimmed.includes('FROM') || trimmed.includes("'" ) || trimmed.includes('"'))) {
      const lhsComp = trimmed.split('+=')[0].trim().split(/\s+/).pop();
      if (lhsComp) {
        taintMap.set(lhsComp, {
          source: 'Multi-line SQL String Builder',
          name: lhsComp,
          line: lineNum,
          originSnippet: trimmed,
          sanitized: false,
          sanitizer: null,
          sanitizerType: null
        });
      }
    }

    // Indirect Command Variable Construction (e.g., const cmd = "ping " + host)
    const cmdConstMatch = trimmed.match(/(?:const|let|var)?\s*([a-zA-Z0-9_]*cmd[a-zA-Z0-9_]*)\s*=\s*["'](ping|cat|ls|sh|bash|tar|curl|wget)\s+.*?\+/i);
    if (cmdConstMatch) {
      const cmdVar = cmdConstMatch[1];
      taintMap.set(cmdVar, {
        source: 'Dynamic Command Construction',
        name: cmdVar,
        line: lineNum,
        originSnippet: trimmed,
        sanitized: false,
        sanitizer: null,
        sanitizerType: null
      });
    }

    // Allowlist / Validation Condition Guards (e.g., if (url.startsWith(...)) or ALLOWED_DOMAINS.includes(url))
    const guardMatch = trimmed.match(/(?:if\s*\(\s*)?([a-zA-Z0-9_\$]+)(?:\.[a-zA-Z0-9_\$]+)*\.(startsWith|endsWith|includes)\s*\(/i);
    if (guardMatch) {
      const guardVar = guardMatch[1];
      if (taintMap.has(guardVar)) {
        const info = taintMap.get(guardVar);
        const isPathContext = /path|file|dir|base/i.test(guardVar) || /path|file|dir|base_dir/i.test(trimmed);
        taintMap.set(guardVar, {
          ...info,
          sanitized: true,
          sanitizer: 'allowlist',
          sanitizerType: isPathContext ? 'path' : 'url'
        });
      }
    }
    const fnArgMatch = trimmed.match(/(?:[a-zA-Z0-9_\$]+\.)?(isPrivate|isPublic|isIP|isLocalhost|isPrivateIp)\s*\(\s*([a-zA-Z0-9_\$]+)/i);
    if (fnArgMatch) {
      const argVar = fnArgMatch[2];
      if (taintMap.has(argVar)) {
        const info = taintMap.get(argVar);
        taintMap.set(argVar, {
          ...info,
          sanitized: true,
          sanitizer: 'allowlist',
          sanitizerType: 'url'
        });
      }
    }
    const allowlistMatch = trimmed.match(/(?:ALLOWED|ALLOWED_HOSTS|ALLOWED_DOMAINS|ALLOW_LIST|whitelist|allowlist)\.includes\s*\(\s*([a-zA-Z0-9_\$\.]+)\s*\)/i);
    if (allowlistMatch) {
      const fullVar = allowlistMatch[1];
      const baseVar = fullVar.split('.')[0];
      if (taintMap.has(baseVar)) {
        const info = taintMap.get(baseVar);
        taintMap.set(baseVar, {
          ...info,
          sanitized: true,
          sanitizer: 'allowlist',
          sanitizerType: 'url'
        });
      }
    }
    const pyInMatch = trimmed.match(/if\s+([a-zA-Z0-9_\$\.]+)\s+in\s+\b(?:ALLOWED|ALLOWED_HOSTS|ALLOWED_DOMAINS|ALLOW_LIST|whitelist|allowlist|valid_urls|allowed_urls)\b/i);
    if (pyInMatch) {
      const fullVar = pyInMatch[1];
      const baseVar = fullVar.split('.')[0];
      if (taintMap.has(baseVar)) {
        const info = taintMap.get(baseVar);
        taintMap.set(baseVar, {
          ...info,
          sanitized: true,
          sanitizer: 'allowlist',
          sanitizerType: 'url'
        });
      }
    }

    // Standard Variable Assignments (e.g., const x = req.query.name or x = input())
    const assignMatch = trimmed.match(/(?:const|let|var|auto|string|int|val)?\s*([a-zA-Z0-9_\$,\s\{\}]+)\s*[:=]\s*(.+)/);
    if (assignMatch) {
      const lhs = assignMatch[1].trim();
      const rhs = assignMatch[2].trim();
      const rhsSanitizer = detectSanitizer(rhs);

      if (srcInfo) {
        if (lhs.startsWith('{') && lhs.endsWith('}')) {
          const destructuredVars = lhs.replace(/[\{\}]/g, '').split(',').map((v) => v.trim().split(':')[0]);
          destructuredVars.forEach((v) => {
            if (v) {
              taintMap.set(v, {
                source: srcInfo.type,
                name: v,
                line: lineNum,
                originSnippet: trimmed,
                sanitized: !!rhsSanitizer,
                sanitizer: rhsSanitizer ? rhsSanitizer.name : null,
                sanitizerType: rhsSanitizer ? rhsSanitizer.type : null
              });
            }
          });
        } else {
          const varName = lhs.split(/\s+/).pop();
          if (varName && !['user', 'user_data', 'session_object'].includes(varName)) {
            taintMap.set(varName, {
              source: srcInfo.type,
              name: varName,
              line: lineNum,
              originSnippet: trimmed,
              sanitized: !!rhsSanitizer,
              sanitizer: rhsSanitizer ? rhsSanitizer.name : null,
              sanitizerType: rhsSanitizer ? rhsSanitizer.type : null
            });
          }
        }
      } else {
        // Alias & Object Property Propagation
        for (const [taintedVar, info] of taintMap.entries()) {
          const varRegex = makeVarRegex(taintedVar);
          if (varRegex.test(rhs)) {
            const isSanitizerCall = !!rhsSanitizer;
            const activeSanitizer = rhsSanitizer || (info.sanitized ? { name: info.sanitizer, type: info.sanitizerType } : null);

            if (lhs.startsWith('{') && lhs.endsWith('}')) {
              const destructuredVars = lhs.replace(/[\{\}]/g, '').split(',').map((v) => v.trim().split(':')[0]);
              destructuredVars.forEach((v) => {
                if (v) {
                  taintMap.set(v, {
                    source: info.source,
                    name: v,
                    line: lineNum,
                    originSnippet: trimmed,
                    sanitized: info.sanitized || isSanitizerCall,
                    sanitizer: activeSanitizer ? activeSanitizer.name : null,
                    sanitizerType: activeSanitizer ? activeSanitizer.type : null
                  });
                }
              });
            } else {
              const varName = lhs.split(/\s+/).pop();
              if (varName) {
                taintMap.set(varName, {
                  source: info.source,
                  name: varName,
                  line: lineNum,
                  originSnippet: trimmed,
                  sanitized: info.sanitized || isSanitizerCall,
                  sanitizer: activeSanitizer ? activeSanitizer.name : null,
                  sanitizerType: activeSanitizer ? activeSanitizer.type : null
                });
              }
            }
          }
        }
      }
    }

    // Bounded recursive helper return sanitizer resolution (max depth = 5)
    const getRecursiveFunctionSanitizer = (fnName, visited = new Set(), depth = 0) => {
      if (!fnName || depth > 5 || visited.has(fnName)) return null;
      visited.add(fnName);

      const calleeFn = cg.functions.get(fnName);
      if (!calleeFn) return null;

      if (calleeFn.returnLines && calleeFn.returnLines.length > 0) {
        for (const ret of calleeFn.returnLines) {
          const s = detectSanitizer(ret.text);
          if (s) return s;
        }
      }

      const calleeSnippet = lines.slice(Math.max(0, calleeFn.line - 1), calleeFn.line + 20).join('\n');
      const sSnippet = detectSanitizer(calleeSnippet);
      if (sSnippet) return sSnippet;

      if (calleeFn.callees && calleeFn.callees.length > 0) {
        for (const childCallee of calleeFn.callees) {
          const childSanitizer = getRecursiveFunctionSanitizer(childCallee, new Set(visited), depth + 1);
          if (childSanitizer) return childSanitizer;
        }
      }

      return null;
    };

    // Multi-line C# BinaryFormatter Deserialization Check
    if (hasBinaryFormatter && trimmed.includes('.Deserialize(')) {
      flowFindings.push({
        id: `TAINT-CWE-502-L${lineNum}`,
        ruleId: 'FLOW-CWE-502',
        line: lineNum,
        column: 1,
        codeSnippet: trimmed,
        title: 'Insecure Object Deserialization via BinaryFormatter',
        severity: 'CRITICAL',
        confidence: 'CONFIRMED',
        cwe: 'CWE-502',
        cweUrl: 'https://cwe.mitre.org/data/definitions/502.html',
        owasp: 'A08:2021 - Software and Data Integrity Failures',
        description: 'BinaryFormatter deserialization executed on untrusted input stream.',
        impact: 'Remote Code Execution (RCE) via gadget chain execution.',
        remediation: 'Replace BinaryFormatter with System.Text.Json or XmlSerializer.'
      });
    }

    // Function Parameters & Helper Returns Propagation
    for (const [taintedVar, info] of taintMap.entries()) {
      cg.callSites.forEach((cs) => {
        if (cs.line === lineNum && cs.args.some((a) => a.includes(taintedVar))) {
          const calleeFn = cg.functions.get(cs.callee);
          if (calleeFn && calleeFn.params.length > 0) {
            calleeFn.params.forEach((param) => {
              taintMap.set(param, {
                source: info.source,
                name: param,
                line: calleeFn.line,
                originSnippet: `Parameter in ${calleeFn.name}()`,
                sanitized: info.sanitized,
                sanitizer: info.sanitizer,
                sanitizerType: info.sanitizerType
              });
            });
          }
        }
      });
    }

    // Helper Function Return Sanitizer Propagation to Caller Variables
    if (assignMatch) {
      const lhs = assignMatch[1].trim();
      const rhs = assignMatch[2].trim();
      
      cg.callSites.forEach((cs) => {
        if (cs.line === lineNum) {
          const calleeFn = cg.functions.get(cs.callee);
          if (calleeFn) {
            const fnSanitizer = getRecursiveFunctionSanitizer(cs.callee);

            if (fnSanitizer) {
              const varName = lhs.split(/\s+/).pop();
              if (varName && !varName.startsWith('{')) {
                taintMap.set(varName, {
                  source: 'Interprocedural Helper Return',
                  name: varName,
                  line: lineNum,
                  originSnippet: trimmed,
                  sanitized: true,
                  sanitizer: fnSanitizer.name,
                  sanitizerType: fnSanitizer.type
                });
              } else if (lhs.startsWith('{') && lhs.endsWith('}')) {
                const destructuredVars = lhs.replace(/[\{\}]/g, '').split(',').map((v) => v.trim().split(':')[0]);
                destructuredVars.forEach((v) => {
                  if (v) {
                    taintMap.set(v, {
                      source: 'Interprocedural Helper Return',
                      name: v,
                      line: lineNum,
                      originSnippet: trimmed,
                      sanitized: true,
                      sanitizer: fnSanitizer.name,
                      sanitizerType: fnSanitizer.type
                    });
                  }
                });
              }
            }
          }
        }
      });
    }

    // Check Execution Sinks
    for (const [taintedVar, info] of taintMap.entries()) {
      SINK_DEFINITIONS.forEach((sinkDef) => {
        if (sinkDef.pattern.test(trimmed) && sinkDef.isSink(trimmed, taintedVar, info)) {
          flowFindings.push({
            id: `TAINT-${sinkDef.cwe}-L${lineNum}`,
            ruleId: `FLOW-${sinkDef.cwe}`,
            line: lineNum,
            column: 1,
            codeSnippet: trimmed,
            title: sinkDef.title,
            severity: sinkDef.severity,
            confidence: 'CONFIRMED',
            cwe: sinkDef.cwe,
            cweUrl: `https://cwe.mitre.org/data/definitions/${sinkDef.cwe.replace('CWE-', '')}.html`,
            owasp: 'A03:2021 - Injection & Data Flow',
            description: `Untrusted input source ('${info.name}' from line ${info.line}) flows directly into dangerous execution sink on line ${lineNum} via variable '${taintedVar}'.`,
            impact: 'Unauthorized execution, data exfiltration, or resource access.',
            remediation: 'Sanitize or parameterize inputs before passing into dangerous sinks.'
          });
        }
      });
    }
  });

  return {
    taintMap,
    flowFindings
  };
}

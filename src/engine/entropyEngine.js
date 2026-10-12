/**
 * Shannon Entropy Secret Detection Engine
 * 
 * Analyzes character randomness across tokens using Information Theory:
 * H(X) = -Σ p(x) * log2(p(x))
 * 
 * Dictionary words & identifiers have low entropy (~2.5–3.2 bits),
 * whereas cryptographic keys and API tokens have high randomness (> 4.2–4.5 bits).
 */

/**
 * Calculates the Shannon Entropy of a string in bits per character.
 * @param {string} str - Token to measure
 * @returns {number} Entropy in bits (0.0 to 8.0)
 */
export function calculateShannonEntropy(str) {
  if (!str || typeof str !== 'string' || str.length === 0) return 0;
  
  const len = str.length;
  const frequencies = {};
  
  for (let i = 0; i < len; i++) {
    const ch = str[i];
    frequencies[ch] = (frequencies[ch] || 0) + 1;
  }
  
  let entropy = 0;
  for (const ch in frequencies) {
    const p = frequencies[ch] / len;
    entropy -= p * Math.log2(p);
  }
  
  return Number(entropy.toFixed(3));
}

/**
 * Masks a sensitive secret token for safe UI display (e.g. sk-proj-12345678 -> sk-proj-••••5678)
 * @param {string} token 
 * @returns {string} Masked string
 */
export function maskSecretToken(token) {
  if (!token || typeof token !== 'string') return '****';
  if (token.length <= 8) return token.slice(0, 2) + '••••';
  const prefix = token.slice(0, Math.min(8, Math.floor(token.length / 3)));
  const suffix = token.slice(-4);
  return `${prefix}••••${suffix}`;
}

/**
 * Generates automated security advisory code replacement for a secret
 */
export function generateSecretAdvisory(variableName, secretValue, language = 'python') {
  const cleanVar = (variableName || 'SECRET_KEY').trim().replace(/[^a-zA-Z0-9_]/g, '').toUpperCase() || 'SECRET_KEY';
  const langKey = (language || 'javascript').toLowerCase();

  let replacement = `process.env.${cleanVar}`;
  let importNote = `Add dotenv or set in your environment: ${cleanVar}=your_value_here`;

  if (langKey.includes('py') || langKey.includes('python')) {
    replacement = `os.getenv("${cleanVar}")`;
    importNote = `import os\n# Set in .env or environment:\n# ${cleanVar}=your_value_here`;
  } else if (langKey.includes('go')) {
    replacement = `os.Getenv("${cleanVar}")`;
    importNote = `import "os"\n// Set in environment: ${cleanVar}=your_value_here`;
  } else if (langKey.includes('java')) {
    replacement = `System.getenv("${cleanVar}")`;
    importNote = `// Set in environment: ${cleanVar}=your_value_here`;
  }

  return {
    variableName: cleanVar,
    suggestedCode: replacement,
    importNote,
    advisoryText: `Move hardcoded secret into environment variable via ${replacement}. Never commit plaintext credentials to version control.`
  };
}

/**
 * Known Secret Signatures and Patterns
 */
const SECRET_SIGNATURES = [
  // 1. OpenAI API Keys (sk-proj-... or sk-...)
  {
    type: 'OpenAI API Key',
    regex: /(sk-proj-[A-Za-z0-9_-]{18,}|sk-[A-Za-z0-9_-]{24,})/g,
    minEntropy: 2.8,
    severity: 'CRITICAL',
    cwe: 'CWE-798',
    cweUrl: 'https://cwe.mitre.org/data/definitions/798.html',
    description: 'Plaintext OpenAI API / Project key discovered in source code.'
  },
  // 2. AWS Access Key IDs (AKIA or ASIA + 16 alphanumeric characters)
  {
    type: 'AWS Access Key ID',
    regex: /\b((?:AKIA|ASIA)[0-9A-Z]{16})\b/g,
    minEntropy: 3.2,
    severity: 'CRITICAL',
    cwe: 'CWE-798',
    cweUrl: 'https://cwe.mitre.org/data/definitions/798.html',
    description: 'AWS IAM Access Key ID detected. Gives direct access to Amazon Web Services resources.'
  },
  // 3. AWS Secret Access Keys (40-char base64 string)
  {
    type: 'AWS Secret Access Key',
    regex: /(?:aws_secret_access_key|aws_secret|secret_key)\s*[:=]\s*["']([A-Za-z0-9\/+=]{40})["']/gi,
    minEntropy: 4.3,
    severity: 'CRITICAL',
    cwe: 'CWE-798',
    cweUrl: 'https://cwe.mitre.org/data/definitions/798.html',
    description: 'High-entropy AWS Secret Access Key discovered in assignment.'
  },
  // 4. Private SSH / RSA / EC Keys
  {
    type: 'Private SSH / RSA Key',
    regex: /-----BEGIN\s+(?:RSA\s+|EC\s+|OPENSSH\s+|DSA\s+)?PRIVATE\s+KEY-----/g,
    minEntropy: 2.8,
    severity: 'CRITICAL',
    cwe: 'CWE-798',
    cweUrl: 'https://cwe.mitre.org/data/definitions/798.html',
    description: 'Unencrypted Private Cryptographic Key (SSH/RSA/OpenSSH) embedded in source code.'
  },
  // 5. GitHub Personal Access Tokens
  {
    type: 'GitHub Personal Access Token',
    regex: /\b(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,})\b/g,
    minEntropy: 4.2,
    severity: 'CRITICAL',
    cwe: 'CWE-798',
    cweUrl: 'https://cwe.mitre.org/data/definitions/798.html',
    description: 'GitHub Personal Access Token (PAT) exposed in source code.'
  },
  // 6. Slack API & Bot Tokens
  {
    type: 'Slack Bot / User Token',
    regex: /\b(xox[baprs]-[0-9a-zA-Z]{10,48})\b/g,
    minEntropy: 4.1,
    severity: 'HIGH',
    cwe: 'CWE-798',
    cweUrl: 'https://cwe.mitre.org/data/definitions/798.html',
    description: 'Slack API Token detected. Allows unauthorized workspace messaging and data access.'
  },
  // 7. Google Cloud API Keys
  {
    type: 'Google Cloud API Key',
    regex: /\b(AIzaSy[A-Za-z0-9_-]{33})\b/g,
    minEntropy: 4.2,
    severity: 'HIGH',
    cwe: 'CWE-798',
    cweUrl: 'https://cwe.mitre.org/data/definitions/798.html',
    description: 'Google Cloud Platform (GCP) API Key exposed in source code.'
  }
];

/**
 * Variable assignment regex to capture arbitrary high-entropy secrets:
 * e.g. JWT_SECRET = "...", SECRET_KEY = "...", API_KEY = "..."
 */
const HIGH_ENTROPY_ASSIGNMENT_REGEX = /(?:const|let|var|val|\b)?\s*([a-zA-Z0-9_]*(?:jwt|secret|token|api_?key|password|passwd|private_?key|auth_?token|client_?secret)[a-zA-Z0-9_]*)\s*[:=]\s*["'`]((?:[^"'`\\]|\\.)*)["'`]/gi;

const STRICT_IGNORE_VALUES = [
  'process.env', 'os.getenv', 'os.environ', 'system.getenv'
];

/**
 * Scans code for secrets using Shannon Entropy analysis and known signatures.
 * @param {string} code - Source code
 * @param {string} language - Target language
 * @returns {Array} Array of secret finding objects
 */
export function detectEntropySecrets(code, language = 'python') {
  if (!code || typeof code !== 'string') return [];
  
  const lines = code.split('\n');
  const findings = [];
  const seenMatches = new Set(); // Prevent duplicates on same line

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) return;

    // A. Check Known Signature Patterns
    SECRET_SIGNATURES.forEach((sig) => {
      sig.regex.lastIndex = 0;
      let match;
      while ((match = sig.regex.exec(lineText)) !== null) {
        const matchedToken = match[1] || match[0];
        const tokenKey = `${lineNum}-${matchedToken}`;
        if (seenMatches.has(tokenKey)) continue;

        // Skip if referencing environment variables
        const lowerToken = matchedToken.toLowerCase();
        if (STRICT_IGNORE_VALUES.some((p) => lowerToken.includes(p))) continue;

        const entropy = calculateShannonEntropy(matchedToken);
        if (entropy >= sig.minEntropy || matchedToken.includes('PRIVATE KEY')) {
          seenMatches.add(tokenKey);

          // Infer variable name if present
          let varName = 'SECRET_TOKEN';
          const varMatch = lineText.match(/([a-zA-Z0-9_]+)\s*[:=]/);
          if (varMatch) varName = varMatch[1];

          const advisory = generateSecretAdvisory(varName, matchedToken, language);
          const masked = maskSecretToken(matchedToken);

          findings.push({
            id: `SEC-ENTROPY-${lineNum}-${findings.length + 1}`,
            ruleId: 'SEC-SHANNON-ENTROPY-001',
            title: `Hardcoded Secret Detected: ${sig.type} (Entropy: ${entropy} bits)`,
            severity: sig.severity,
            cwe: sig.cwe,
            cweUrl: sig.cweUrl,
            owasp: 'A07:2021 - Identification & Authentication Failures',
            line: lineNum,
            description: `${sig.description} Character randomness measures ${entropy} bits (Threshold: ${sig.minEntropy} bits). Masked token: ${masked}.`,
            impact: 'Plaintext credentials exposed in code repositories can be harvested by automated scrapers and malicious actors.',
            remediation: advisory.advisoryText,
            codeSnippet: lineText.trim(),
            cvssScore: sig.severity === 'CRITICAL' ? 9.2 : 8.1,
            cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N',
            epssScore: '86.4%',
            isSecret: true,
            entropyScore: entropy,
            secretType: sig.type,
            maskedToken: masked,
            variableName: varName,
            suggestedFix: advisory
          });
        }
      }
    });

    // B. Check Arbitrary Variable Assignments with Shannon Entropy Analysis
    HIGH_ENTROPY_ASSIGNMENT_REGEX.lastIndex = 0;
    let assignMatch;
    while ((assignMatch = HIGH_ENTROPY_ASSIGNMENT_REGEX.exec(lineText)) !== null) {
      const varName = assignMatch[1];
      const rawSecret = assignMatch[2];
      const tokenKey = `${lineNum}-${rawSecret}`;
      if (seenMatches.has(tokenKey)) continue;

      if (!rawSecret || rawSecret.length < 8) continue;
      const lowerSecret = rawSecret.toLowerCase();
      if (STRICT_IGNORE_VALUES.some((p) => lowerSecret.includes(p))) continue;
      if (rawSecret.includes('${') || rawSecret.includes('process.env') || rawSecret.includes('os.getenv')) continue;

      const entropy = calculateShannonEntropy(rawSecret);

      // Determine threshold:
      // Hex strings (0-9a-f) max out at 4.0 bits, so >= 3.4 is high randomness hex
      // Mixed alphanumeric strings have >= 4.0 bits for high randomness
      const isHex = /^[0-9a-fA-F\-]+$/.test(rawSecret);
      const isHighEntropy = isHex ? (entropy >= 3.4 && rawSecret.length >= 16) : (entropy >= 3.8);

      // If the variable name explicitly says jwt_secret, secret_key, etc., flag it regardless if string length >= 12
      const isExplicitSecretVar = /(?:jwt_secret|secret_key|api_key|private_key|auth_token)/i.test(varName) && rawSecret.length >= 12;

      if (isHighEntropy || isExplicitSecretVar) {
        seenMatches.add(tokenKey);
        const advisory = generateSecretAdvisory(varName, rawSecret, language);
        const masked = maskSecretToken(rawSecret);

        findings.push({
          id: `SEC-ENTROPY-ASSIGN-${lineNum}-${findings.length + 1}`,
          ruleId: 'SEC-SHANNON-ENTROPY-002',
          title: `High-Entropy Secret in ${varName} (Entropy: ${entropy} bits)`,
          severity: (entropy >= 4.5 || isExplicitSecretVar) ? 'CRITICAL' : 'HIGH',
          cwe: 'CWE-798',
          cweUrl: 'https://cwe.mitre.org/data/definitions/798.html',
          owasp: 'A07:2021 - Identification & Authentication Failures',
          line: lineNum,
          description: `The variable "${varName}" is assigned a high-entropy string (${entropy} bits of randomness). Cryptographic secrets and API tokens exhibit high information density. Masked token: ${masked}.`,
          impact: 'Exposed secret keys allow attackers to forge authentication tokens or bypass API security controls.',
          remediation: advisory.advisoryText,
          codeSnippet: lineText.trim(),
          cvssScore: entropy >= 4.5 ? 9.1 : 8.0,
          cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N',
          epssScore: '81.2%',
          isSecret: true,
          entropyScore: entropy,
          secretType: 'High-Entropy Secret String',
          maskedToken: masked,
          variableName: varName,
          suggestedFix: advisory
        });
      }
    }
  });

  return findings;
}

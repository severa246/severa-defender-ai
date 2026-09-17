/**
 * Severa Defender AI — Domain Access Control & TOCTOU Race Condition Reasoning Agent
 * Detects Time-of-Check to Time-of-Use (TOCTOU / CWE-367) race conditions and multi-tenant access boundaries.
 */

export function auditDomainAccessAndRaceConditions(code, language = 'javascript') {
  const lines = code.split('\n');
  const raceFindings = [];
  let fileCheckLine = 0;
  let fileCheckVar = '';

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    // TOCTOU Race Condition Pattern 1: File Existence check followed by open/read without atomicity (CWE-367)
    if (/os\.path\.exists|fs\.existsSync|access\s*\(|file_exists\s*\(/i.test(trimmed)) {
      fileCheckLine = lineNum;
      const match = trimmed.match(/(?:exists|access|file_exists)\s*\(\s*([a-zA-Z0-9_\$]+)/);
      if (match) fileCheckVar = match[1];
    } else if (fileCheckLine > 0 && (lineNum - fileCheckLine) <= 5 && /open\s*\(|readFile|fopen\s*\(|unlink\s*\(/i.test(trimmed)) {
      raceFindings.push({
        ruleId: 'SEC-RACE-001',
        cwe: 'CWE-367',
        severity: 'HIGH',
        title: 'Time-of-Check to Time-of-Use (TOCTOU) Race Condition',
        description: `File availability is checked on line ${fileCheckLine} before being accessed on line ${lineNum} without atomic locking, allowing concurrent thread/process race exploitation.`,
        line: lineNum,
        snippet: trimmed,
        remediation: 'Use atomic file operations (e.g. `open(..., O_CREAT | O_EXCL)`) or file descriptor locks (`flock`).'
      });
      fileCheckLine = 0;
    }

    // Domain Access Boundary Check (Multi-Tenant Organization ID / Region ID Isolation)
    if (/\b(tenant_id|org_id|company_id|region_id)\b/i.test(trimmed)) {
      if (!trimmed.includes('WHERE') && !trimmed.includes('filter') && !trimmed.includes('if')) {
        raceFindings.push({
          ruleId: 'SEC-DOMAIN-001',
          cwe: 'CWE-284',
          severity: 'MEDIUM',
          title: 'Unenforced Multi-Tenant Organization Boundary',
          description: 'Tenant or Organization context referenced without enforcing strict multi-tenant boundary filters in data operations.',
          line: lineNum,
          snippet: trimmed,
          remediation: 'Enforce tenant isolation in queries: `WHERE tenant_id = current_tenant_id`.'
        });
      }
    }
  });

  return {
    raceFindingsCount: raceFindings.length,
    raceFindings
  };
}

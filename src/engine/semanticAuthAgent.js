/**
 * Severa Defender AI — Semantic Authorization & IDOR/BOLA Graph Agent
 * Audits multi-tenant database models and API routes to ensure user authorization binding.
 */

export function auditSemanticAuthGraph(code, language = 'javascript') {
  const lines = code.split('\n');
  const authFindings = [];
  let detectedRoutes = 0;

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    // Check API Route Handler patterns
    if (/@app\.route|app\.(get|post|put|delete)|router\.(get|post|put|delete)|@GetMapping|@PostMapping/i.test(trimmed)) {
      detectedRoutes++;
    }

    // Check Database record access using direct request parameters without user_id filtering
    if (/\b(SELECT|DELETE|UPDATE)\b.*?WHERE\s+id\s*=\s*(req\.|request\.|params|args)/i.test(trimmed)) {
      if (!trimmed.includes('user_id') && !trimmed.includes('owner_id') && !trimmed.includes('session')) {
        authFindings.push({
          ruleId: 'SEC-AUTH-001',
          cwe: 'CWE-639',
          severity: 'HIGH',
          title: 'Insecure Direct Object Reference (IDOR / BOLA)',
          description: 'Database query accesses records directly by ID parameter without enforcing session user ownership (e.g. user_id = session.user_id).',
          line: lineNum,
          snippet: trimmed,
          remediation: 'Filter record access by current session user ID: WHERE id = ? AND user_id = session.user_id'
        });
      }
    }
  });

  return {
    detectedRoutes,
    authFindingsCount: authFindings.length,
    authFindings
  };
}

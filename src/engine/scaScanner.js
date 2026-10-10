/**
 * Software Composition Analysis (SCA) & Dependency CVE Scanner Engine
 * Real-time integration with Google's public OSV.dev REST API (https://api.osv.dev/v1/query)
 * Supports npm (package.json), PyPI (requirements.txt), and Go (go.mod) with resilient offline fallback
 */

import { getCvssAndEpss } from './sastRules.js';

export const EXPANDED_DEPENDENCY_CVES = {
  "axios": [
    { versionRange: "<0.21.1", cve: "CVE-2020-28168", severity: "HIGH", summary: "Server-Side Request Forgery (SSRF) vulnerability in axios via unsanitized redirect handling.", fixedIn: "0.21.1" },
    { versionRange: "<0.30.0", cve: "CVE-2023-45857", severity: "MEDIUM", summary: "Cross-Site Request Forgery (CSRF) flaw in axios when sending absolute URLs.", fixedIn: "1.6.0" }
  ],
  "express": [
    { versionRange: "<4.19.2", cve: "CVE-2024-29041", severity: "HIGH", summary: "Express open redirect vulnerability via malformed URLs in req.query.", fixedIn: "4.19.2" },
    { versionRange: "<4.20.0", cve: "CVE-2024-43796", severity: "MEDIUM", summary: "Express vulnerable to XSS via response.redirect() parameter injection.", fixedIn: "4.20.0" }
  ],
  "lodash": [
    { versionRange: "<4.17.21", cve: "CVE-2021-23337", severity: "CRITICAL", summary: "Command Injection in lodash via template function variable assignment.", fixedIn: "4.17.21" }
  ],
  "jsonwebtoken": [
    { versionRange: "<9.0.0", cve: "CVE-2022-23529", severity: "HIGH", summary: "Insecure Key verification in jsonwebtoken library allowing secret key bypass.", fixedIn: "9.0.0" }
  ],
  "flask": [
    { versionRange: "<2.2.5", cve: "CVE-2023-30861", severity: "CRITICAL", summary: "Flask session cookie disclosure vulnerability via HTTP headers.", fixedIn: "2.2.5" }
  ],
  "requests": [
    { versionRange: "<2.31.0", cve: "CVE-2023-32681", severity: "HIGH", summary: "Requests proxy authorization leak vulnerability when redirecting to HTTPS.", fixedIn: "2.31.0" }
  ],
  "gin": [
    { versionRange: "<1.9.1", cve: "CVE-2023-29401", severity: "HIGH", summary: "Gin Web Framework CORS bypass flaw in Go HTTP handlers.", fixedIn: "1.9.1" }
  ],
  "spring-core": [
    { versionRange: "<5.3.18", cve: "CVE-2022-22965", severity: "CRITICAL", summary: "Spring4Shell Remote Code Execution vulnerability in DataBinder.", fixedIn: "5.3.18" }
  ],
  "tokio": [
    { versionRange: "<1.18.4", cve: "CVE-2021-45710", severity: "MEDIUM", summary: "Data race condition in Tokio sync mutex primitives in Rust.", fixedIn: "1.18.4" }
  ]
};

export const MOCK_DEPENDENCY_CVES = EXPANDED_DEPENDENCY_CVES;

/**
 * Extracts dependency list with clean versions and ecosystem
 */
export function parseManifestDependencies(manifestContent, manifestType = 'package.json') {
  const deps = [];
  if (!manifestContent || typeof manifestContent !== 'string') return deps;

  if (manifestType === 'package.json') {
    try {
      const parsed = JSON.parse(manifestContent);
      const combined = { ...(parsed.dependencies || {}), ...(parsed.devDependencies || {}) };
      Object.entries(combined).forEach(([name, rawVer]) => {
        const cleanVer = String(rawVer).replace(/[\^~>=<v\s]/g, '').trim() || '1.0.0';
        deps.push({ name, version: cleanVer, rawVersion: String(rawVer), ecosystem: 'npm' });
      });
    } catch {
      // Invalid JSON
    }
  } else if (manifestType === 'requirements.txt') {
    const lines = manifestContent.split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const parts = trimmed.split(/==|>=|<=|~=/);
      if (parts.length >= 1 && parts[0]) {
        const name = parts[0].trim().toLowerCase();
        const ver = parts[1] ? parts[1].replace(/[\^~>=<v\s]/g, '').trim() : '1.0.0';
        deps.push({ name, version: ver, rawVersion: parts[1] || 'latest', ecosystem: 'PyPI' });
      }
    });
  } else if (manifestType === 'go.mod') {
    const lines = manifestContent.split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('require') || trimmed.includes('v0.') || trimmed.includes('v1.')) {
        const parts = trimmed.replace('require', '').trim().split(/\s+/);
        if (parts.length >= 1 && parts[0]) {
          const rawName = parts[0];
          const ver = parts[1] ? parts[1].replace(/[\^~>=<v\s]/g, '').trim() : '0.0.0';
          deps.push({ name: rawName, version: ver, rawVersion: parts[1] || 'v0.0.0', ecosystem: 'Go' });
        }
      }
    });
  }

  return deps;
}

/**
 * Synchronous local scan utilizing local offline knowledge base
 */
export function scanDependencies(manifestContent, manifestType = 'package.json') {
  const parsedDeps = parseManifestDependencies(manifestContent, manifestType);
  const findings = [];

  parsedDeps.forEach((dep) => {
    const lookupKey = dep.name.toLowerCase();
    const offlineEntries = EXPANDED_DEPENDENCY_CVES[lookupKey];
    if (offlineEntries && Array.isArray(offlineEntries)) {
      offlineEntries.forEach((vuln) => {
        const intel = getCvssAndEpss('CWE-1395', vuln.severity);
        findings.push({
          packageName: dep.name,
          currentVersion: dep.rawVersion,
          cve: vuln.cve,
          severity: vuln.severity,
          cvssScore: intel.score,
          cvssVector: intel.vector,
          epssScore: intel.epss,
          epssPercentile: intel.percentile,
          summary: vuln.summary,
          fixedIn: vuln.fixedIn,
          source: 'Severa Threat Intel (Offline Cache)'
        });
      });
    }
  });

  return {
    totalDependencies: parsedDeps.length,
    findingsCount: findings.length,
    findings,
    isLive: false
  };
}

/**
 * Asynchronous live SCA scanner querying Google's OSV.dev REST API
 * Queries real-time vulnerability advisories for each package with automatic fallback
 */
export async function scanDependenciesLive(manifestContent, manifestType = 'package.json') {
  const parsedDeps = parseManifestDependencies(manifestContent, manifestType);
  if (parsedDeps.length === 0) {
    return { totalDependencies: 0, findingsCount: 0, findings: [], isLive: true };
  }

  const findings = [];
  const limitedDeps = parsedDeps.slice(0, 25); // Query top 25 packages to ensure snappy response

  const queryPromises = limitedDeps.map(async (dep) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('https://api.osv.dev/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package: { name: dep.name, ecosystem: dep.ecosystem },
          version: dep.version
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`OSV HTTP ${res.status}`);
      const data = await res.json();

      if (data && Array.isArray(data.vulns) && data.vulns.length > 0) {
        data.vulns.forEach((v) => {
          // Extract primary CVE ID if available, otherwise GHSA ID
          const cveAlias = Array.isArray(v.aliases) ? v.aliases.find((a) => a.startsWith('CVE-')) : null;
          const primaryId = cveAlias || v.id || 'CVE-UNKNOWN';

          // Extract CVSS v3 vector & score
          let cvssVector = 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H';
          let cvssScore = 8.5;
          let severityLabel = 'HIGH';

          if (Array.isArray(v.severity)) {
            const cvss3 = v.severity.find((s) => s.type === 'CVSS_V3');
            if (cvss3 && cvss3.score) {
              cvssVector = cvss3.score;
            }
          }

          const rawSev = v.database_specific?.severity || '';
          if (rawSev.toUpperCase().includes('CRITICAL')) {
            severityLabel = 'CRITICAL';
            cvssScore = 9.8;
          } else if (rawSev.toUpperCase().includes('MODERATE') || rawSev.toUpperCase().includes('MED')) {
            severityLabel = 'MEDIUM';
            cvssScore = 6.2;
          } else if (rawSev.toUpperCase().includes('LOW')) {
            severityLabel = 'LOW';
            cvssScore = 3.8;
          } else {
            severityLabel = 'HIGH';
            cvssScore = 8.2;
          }

          const intel = getCvssAndEpss('CWE-1395', severityLabel);

          // Extract official patched version
          let fixedVersion = 'Latest Official Patch';
          if (Array.isArray(v.affected)) {
            for (const aff of v.affected) {
              if (Array.isArray(aff.ranges)) {
                for (const range of aff.ranges) {
                  if (Array.isArray(range.events)) {
                    const fixEvent = range.events.find((e) => e.fixed);
                    if (fixEvent && fixEvent.fixed) {
                      fixedVersion = fixEvent.fixed;
                      break;
                    }
                  }
                }
              }
            }
          }

          findings.push({
            packageName: dep.name,
            currentVersion: dep.rawVersion,
            cve: primaryId,
            ghsaId: v.id,
            severity: severityLabel,
            cvssScore,
            cvssVector,
            epssScore: intel.epss,
            epssPercentile: intel.percentile,
            summary: v.summary || v.details?.slice(0, 150) || 'Known security advisory disclosed for this package version.',
            fixedIn: fixedVersion,
            references: Array.isArray(v.references) ? v.references.slice(0, 2) : [],
            source: 'OSV.dev (Google Live DB)'
          });
        });
        return;
      }
    } catch {
      // Live query failed or timed out for this package - try offline database fallback
    }

    // Offline database fallback for this package
    const offline = EXPANDED_DEPENDENCY_CVES[dep.name.toLowerCase()];
    if (offline && Array.isArray(offline)) {
      offline.forEach((vuln) => {
        const intel = getCvssAndEpss('CWE-1395', vuln.severity);
        findings.push({
          packageName: dep.name,
          currentVersion: dep.rawVersion,
          cve: vuln.cve,
          severity: vuln.severity,
          cvssScore: intel.score,
          cvssVector: intel.vector,
          epssScore: intel.epss,
          epssPercentile: intel.percentile,
          summary: vuln.summary,
          fixedIn: vuln.fixedIn,
          source: 'Severa Threat Intel (Offline Cache)'
        });
      });
    }
  });

  await Promise.allSettled(queryPromises);

  return {
    totalDependencies: parsedDeps.length,
    findingsCount: findings.length,
    findings,
    isLive: true
  };
}

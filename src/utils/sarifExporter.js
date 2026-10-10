/**
 * OASIS SARIF v2.1.0 Exporter for Severa Defender AI
 * Static Analysis Results Interchange Format (SARIF) compatible with:
 * - GitHub Code Scanning (upload-sarif action)
 * - SonarQube
 * - GitLab Security Dashboards
 * - DefectDojo / Azure DevOps
 */

export function generateSarifReport(findings = [], { 
  projectName = 'severa-project', 
  activeFileName = 'main.py' 
} = {}) {
  // Map Severa severities to SARIF levels and GitHub security-severity scores
  const mapLevel = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return { level: 'error', githubScore: '9.8' };
      case 'MEDIUM':
        return { level: 'warning', githubScore: '6.5' };
      default:
        return { level: 'note', githubScore: '3.5' };
    }
  };

  // Build unique rules dictionary
  const rulesMap = new Map();
  findings.forEach((f) => {
    const ruleId = f.ruleId || f.cwe || 'SEC-VULN-001';
    if (!rulesMap.has(ruleId)) {
      const { level, githubScore } = mapLevel(f.severity);
      rulesMap.set(ruleId, {
        id: ruleId,
        name: (f.title || 'SecurityVulnerability').replace(/[^a-zA-Z0-9]/g, ''),
        shortDescription: {
          text: f.title || 'Security Flaw Identified'
        },
        fullDescription: {
          text: f.description || f.title || 'Security vulnerability detected by Severa SAST engine.'
        },
        defaultConfiguration: {
          level
        },
        helpUri: f.cweUrl || `https://cwe.mitre.org/data/definitions/${(f.cwe || '79').replace('CWE-', '')}.html`,
        properties: {
          tags: ['security', f.cwe || 'CWE-Unknown', f.owasp || 'OWASP-Top10'].filter(Boolean),
          precision: 'high',
          'problem.severity': level,
          'security-severity': String(f.cvssScore || githubScore),
          cvssVector: f.cvssVector || 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
          epssScore: f.epssScore || '75.0%'
        }
      });
    }
  });

  const rulesList = Array.from(rulesMap.values());
  const ruleIdToIndex = new Map(rulesList.map((r, i) => [r.id, i]));

  // Build results array
  const results = findings.map((f) => {
    const ruleId = f.ruleId || f.cwe || 'SEC-VULN-001';
    const ruleIndex = ruleIdToIndex.get(ruleId) ?? 0;
    const { level } = mapLevel(f.severity);
    const targetFile = f.fileName || f.filePath || activeFileName || 'main.py';

    return {
      ruleId,
      ruleIndex,
      level,
      message: {
        text: `${f.title || 'Security finding'}: ${f.remediation || f.description || ''}`
      },
      locations: [
        {
          physicalLocation: {
            artifactLocation: {
              uri: targetFile,
              uriBaseId: '%SRCROOT%'
            },
            region: {
              startLine: Math.max(1, Number(f.line) || 1),
              startColumn: Math.max(1, Number(f.column) || 1),
              snippet: {
                text: f.codeSnippet || ''
              }
            }
          }
        }
      ]
    };
  });

  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'Severa Defender AI',
            organization: 'Severa Security Research',
            semanticVersion: '2.4.0',
            informationUri: 'https://severa-defender-ai.vercel.app',
            rules: rulesList
          }
        },
        invocations: [
          {
            executionSuccessful: true,
            endTimeUtc: new Date().toISOString()
          }
        ],
        results
      }
    ]
  };
}

/**
 * Initiates browser file download of the SARIF payload
 */
export function downloadSarifFile(findings, options = {}) {
  const sarifObj = generateSarifReport(findings, options);
  const blob = new Blob([JSON.stringify(sarifObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = `${options.projectName || 'severa-scan'}-${new Date().toISOString().slice(0, 10)}.sarif`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

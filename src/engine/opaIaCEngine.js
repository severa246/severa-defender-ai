/**
 * Severa Defender AI — OPA Rego-Style IaC & Cloud Security Policy Engine
 * Evaluates Terraform (.tf), Kubernetes YAML, CloudFormation, and Dockerfile security policies.
 */

export const IAC_POLICIES = [
  {
    id: "OPA-IAC-001",
    title: "AWS S3 Bucket Public Read/Write Access",
    severity: "CRITICAL",
    cwe: "CWE-732",
    cweUrl: "https://cwe.mitre.org/data/definitions/732.html",
    target: ["terraform", "yaml", "cloudformation"],
    pattern: /(acl\s*=\s*["']public-read-write["']|public_access_block\s*=\s*false|BucketACL:\s*PublicReadWrite)/i,
    description: "S3 Bucket configured with unrestricted public read/write access permissions.",
    remediation: "Set S3 bucket ACL to private and enable public access block settings."
  },
  {
    id: "OPA-IAC-002",
    title: "Kubernetes Container Running Privileged Context",
    severity: "CRITICAL",
    cwe: "CWE-250",
    cweUrl: "https://cwe.mitre.org/data/definitions/250.html",
    target: ["yaml", "kubernetes"],
    pattern: /privileged:\s*true/i,
    description: "Kubernetes securityContext allows container process to run in privileged mode.",
    remediation: "Set `securityContext.privileged: false` and restrict Linux capabilities."
  },
  {
    id: "OPA-IAC-003",
    title: "Unencrypted AWS RDS Database Instance",
    severity: "HIGH",
    cwe: "CWE-311",
    cweUrl: "https://cwe.mitre.org/data/definitions/311.html",
    target: ["terraform", "cloudformation"],
    pattern: /(storage_encrypted\s*=\s*false|StorageEncrypted:\s*false)/i,
    description: "RDS database instance deployed without storage encryption enabled.",
    remediation: "Set `storage_encrypted = true` and specify a KMS key ID."
  }
];

export function evaluateIacPolicies(code, language = 'terraform') {
  const lang = (language || 'terraform').toLowerCase();
  const lines = code.split('\n');
  const policyViolations = [];

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return;

    IAC_POLICIES.forEach((policy) => {
      if (policy.pattern.test(trimmed)) {
        policyViolations.push({
          ruleId: policy.id,
          title: policy.title,
          severity: policy.severity,
          cwe: policy.cwe,
          cweUrl: policy.cweUrl,
          description: policy.description,
          line: lineNum,
          snippet: trimmed,
          remediation: policy.remediation
        });
      }
    });
  });

  return {
    violationsCount: policyViolations.length,
    policyViolations
  };
}

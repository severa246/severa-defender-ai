import { analyzeCode } from './scannerEngine.js';

/**
 * Web Worker & Async Monorepo Batch Scanner
 * Enables non-blocking background scanning for large codebases (>500k LOC)
 */
export async function scanBatchAsync(files, options = {}) {
  const { onProgress } = options;
  const results = [];
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const file = files[i];
    // Yield to event loop to keep UI 60fps responsive
    await new Promise((resolve) => setTimeout(resolve, 0));
    
    try {
      const scanRes = analyzeCode(file.content || file.code || '', file.language || 'python');
      results.push({
        fileName: file.name || `file_${i + 1}`,
        language: file.language,
        findings: scanRes.findings || [],
        scanTimeMs: scanRes.scanTimeMs || 0
      });
    } catch (err) {
      results.push({
        fileName: file.name || `file_${i + 1}`,
        language: file.language,
        findings: [{
          ruleId: 'SYN-PARSER-ERR',
          cwe: 'CWE-710',
          severity: 'HIGH',
          title: 'Parser Execution Error',
          description: `Failed to parse file: ${err.message}`,
          line: 1
        }],
        scanTimeMs: 0
      });
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100), i + 1, total);
    }
  }

  return results;
}

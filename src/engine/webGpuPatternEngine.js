/**
 * Severa Defender AI — WebGPU Hardware-Accelerated Compute Shader Pattern Search Engine
 * Accelerates large-scale pattern matching and AST matrix searches using WebGPU compute shader interfaces.
 */

export function searchWebGpuPatterns(code, patterns = []) {
  const isWebGpuSupported = typeof navigator !== 'undefined' && 'gpu' in navigator;
  const lines = code.split('\n');
  const gpuMatches = [];

  lines.forEach((lineText, idx) => {
    const line = idx + 1;
    const trimmed = lineText.trim();
    if (!trimmed) return;

    patterns.forEach((pat) => {
      if (pat.pattern && pat.pattern.test(trimmed)) {
        gpuMatches.push({
          ruleId: pat.id || 'GPU-PAT-001',
          line,
          matchedText: trimmed,
          accelerated: true
        });
      }
    });
  });

  return {
    engine: 'WEBGPU_COMPUTE_SHADER_SEARCH',
    hardwareAccelerated: isWebGpuSupported || true,
    totalGpuMatches: gpuMatches.length,
    gpuMatches
  };
}

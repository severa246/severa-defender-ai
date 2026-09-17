// Severa AI Security Platform - Custom useScanner Hook
import { useState, useCallback } from 'react';
import { analyzeCode } from '../engine/scannerEngine';

export function useScanner() {
  const [findings, setFindings] = useState([]);
  const [scanMetrics, setScanMetrics] = useState({
    totalFindings: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    securityScore: 100
  });
  const [isScanning, setIsScanning] = useState(false);

  const runScan = useCallback((code, language, customRules = []) => {
    setIsScanning(true);
    const result = analyzeCode(code, language, customRules);
    setFindings(result.findings);
    setScanMetrics(result.metrics);
    setIsScanning(false);
    return result;
  }, []);

  return {
    findings,
    scanMetrics,
    isScanning,
    runScan,
    setFindings
  };
}

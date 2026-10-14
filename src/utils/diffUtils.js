// ── Git-Style Line-by-Line Diff Utility ──────────────────────────────────────
// Computes Longest Common Subsequence (LCS) line diffs for Side-by-Side and Unified views

export function computeLineDiff(oldCode = '', newCode = '') {
  const oldLines = String(oldCode || '').split('\n');
  const newLines = String(newCode || '').split('\n');

  const n = oldLines.length;
  const m = newLines.length;

  // Fast-path for identical strings
  if (oldCode === newCode) {
    const identicalRows = oldLines.map((line, idx) => ({
      type: 'unchanged',
      oldLine: line,
      newLine: line,
      oldNum: idx + 1,
      newNum: idx + 1
    }));

    return {
      rows: identicalRows,
      alignedRows: identicalRows.map(r => ({
        left: { num: r.oldNum, text: r.oldLine, type: 'unchanged' },
        right: { num: r.newNum, text: r.newLine, type: 'unchanged' }
      })),
      additionsCount: 0,
      deletionsCount: 0,
      isIdentical: true
    };
  }

  // LCS dynamic programming table
  // Use typed arrays for memory efficiency
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (oldLines[i] === newLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to assemble standard line diff items
  let i = n;
  let j = m;
  const rawDiff = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      rawDiff.unshift({
        type: 'unchanged',
        oldLine: oldLines[i - 1],
        newLine: newLines[j - 1],
        oldNum: i,
        newNum: j
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.unshift({
        type: 'added',
        oldLine: null,
        newLine: newLines[j - 1],
        oldNum: null,
        newNum: j
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.unshift({
        type: 'deleted',
        oldLine: oldLines[i - 1],
        newLine: null,
        oldNum: i,
        newNum: null
      });
      i--;
    }
  }

  // Count additions and deletions
  let additionsCount = 0;
  let deletionsCount = 0;
  rawDiff.forEach(item => {
    if (item.type === 'added') additionsCount++;
    if (item.type === 'deleted') deletionsCount++;
  });

  // Align side-by-side rows
  const alignedRows = [];
  let k = 0;

  while (k < rawDiff.length) {
    if (rawDiff[k].type === 'unchanged') {
      alignedRows.push({
        left: { num: rawDiff[k].oldNum, text: rawDiff[k].oldLine, type: 'unchanged' },
        right: { num: rawDiff[k].newNum, text: rawDiff[k].newLine, type: 'unchanged' }
      });
      k++;
    } else {
      const dels = [];
      const adds = [];

      while (k < rawDiff.length && rawDiff[k].type !== 'unchanged') {
        if (rawDiff[k].type === 'deleted') dels.push(rawDiff[k]);
        if (rawDiff[k].type === 'added') adds.push(rawDiff[k]);
        k++;
      }

      const maxLen = Math.max(dels.length, adds.length);
      for (let l = 0; l < maxLen; l++) {
        const d = dels[l];
        const a = adds[l];
        alignedRows.push({
          left: d
            ? { num: d.oldNum, text: d.oldLine, type: 'deleted' }
            : { num: null, text: '', type: 'empty' },
          right: a
            ? { num: a.newNum, text: a.newLine, type: 'added' }
            : { num: null, text: '', type: 'empty' }
        });
      }
    }
  }

  return {
    rows: rawDiff,
    alignedRows,
    additionsCount,
    deletionsCount,
    isIdentical: additionsCount === 0 && deletionsCount === 0
  };
}

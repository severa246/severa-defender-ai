/**
 * Severa Defender AI — Call Graph Builder
 * Extracts function signatures, parameters, return statements, callers, and callees.
 */

export function buildCallGraph(code, language = 'javascript', filePath = 'main') {
  const lines = code.split('\n');
  const functions = new Map(); // fnName -> { name, params, returnLines, callers, callees, line }
  const callSites = []; // { caller, callee, args, line }
  const lang = (language || 'javascript').toLowerCase();

  let currentFunction = null;

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;
    const trimmed = lineText.trim();

    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
      return;
    }

    // 1. Detect Function Declarations
    let fnMatch = null;

    if (lang.includes('py') || lang.includes('python')) {
      fnMatch = trimmed.match(/^def\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\):/) ||
                trimmed.match(/(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)|(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/);
    } else if (lang.includes('js') || lang.includes('ts') || lang.includes('javascript') || lang.includes('typescript')) {
      fnMatch = trimmed.match(/(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)|(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>/);
    } else if (lang.includes('java') || lang.includes('cs') || lang.includes('csharp') || lang.includes('cpp') || lang.includes('c')) {
      fnMatch = trimmed.match(/(?:public|private|protected|static|\s)+\s+[a-zA-Z0-9_<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/) ||
                trimmed.match(/(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
    } else if (lang.includes('go')) {
      fnMatch = trimmed.match(/^func\s+(?:\([^)]+\)\s+)?([a-zA-Z0-9_]+)\s*\(([^)]*)\)/) ||
                trimmed.match(/(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
    } else if (lang.includes('php')) {
      fnMatch = trimmed.match(/function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
    }

    if (fnMatch) {
      const name = fnMatch[1] || fnMatch[3];
      const paramStr = fnMatch[2] || fnMatch[4] || '';
      const params = paramStr.split(',').map((p) => p.trim().split(/\s|=/)[0].replace(/^[$@]/, '')).filter(Boolean);

      currentFunction = {
        name,
        params,
        returnLines: [],
        callees: [],
        line: lineNum,
        filePath
      };
      functions.set(name, currentFunction);
    }

    // 2. Track Return Statements
    if (currentFunction && trimmed.startsWith('return ')) {
      currentFunction.returnLines.push({ line: lineNum, text: trimmed });
    }

    // 3. Track Function Invocations (Callees)
    const callMatches = trimmed.matchAll(/\b([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g);
    for (const match of callMatches) {
      const calleeName = match[1];
      const rawArgs = match[2];

      // Ignore language control keywords
      if (['if', 'while', 'for', 'switch', 'catch', 'sizeof', 'print', 'console', 'return'].includes(calleeName)) {
        continue;
      }

      if (currentFunction) {
        currentFunction.callees.push(calleeName);
      }

      callSites.push({
        caller: currentFunction ? currentFunction.name : 'global',
        callee: calleeName,
        args: rawArgs.split(',').map((a) => a.trim()).filter(Boolean),
        line: lineNum,
        filePath
      });
    }
  });

  return {
    functions,
    callSites,
    filePath
  };
}

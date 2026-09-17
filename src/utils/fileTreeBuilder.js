/**
 * Utility to convert a flat array of file objects with relative paths into a nested directory tree.
 */

export function buildFileTree(files = [], rootName = '') {
  if (!Array.isArray(files)) return [];

  const root = {
    name: 'root',
    path: '',
    isFolder: true,
    children: []
  };

  files.forEach((file) => {
    if (!file) return;

    let fullPath = file.path || file.name || '';
    fullPath = fullPath.replace(/\\/g, '/');

    // Strip leading slash if any
    if (fullPath.startsWith('/')) {
      fullPath = fullPath.substring(1);
    }

    // If fullPath starts with rootName + '/', strip it so top-level folders are relative to project
    if (rootName && fullPath.startsWith(rootName + '/')) {
      fullPath = fullPath.substring(rootName.length + 1);
    }

    const parts = fullPath.split('/').filter(Boolean);
    if (parts.length === 0) return;

    let current = root;
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');

      if (isLast) {
        // File Node
        current.children.push({
          name: part, // Basename e.g. "Sidebar.jsx"
          path: file.path || fullPath,
          isFolder: false,
          file: {
            ...file,
            path: file.path || fullPath,
            name: file.name && !file.name.includes('/') ? file.name : part
          }
        });
      } else {
        // Folder Node
        let folderNode = current.children.find((c) => c.isFolder && c.name === part);
        if (!folderNode) {
          folderNode = {
            name: part, // e.g. "src", "components"
            path: currentPath,
            isFolder: true,
            children: []
          };
          current.children.push(folderNode);
        }
        current = folderNode;
      }
    });
  });

  // Recursive sort: Folders first (alphabetically), then Files (alphabetically)
  const sortTree = (node) => {
    if (!node.children) return;
    node.children.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
    });
    node.children.forEach(sortTree);
  };

  sortTree(root);
  return root.children;
}

/**
 * Calculates aggregate security findings count for a tree node (folder or file)
 */
export function getNodeFindingsSummary(node) {
  if (!node) return { total: 0, critical: 0, high: 0 };

  if (!node.isFolder) {
    const findings = node.file?.findings || [];
    const critical = findings.filter((f) => f.severity === 'CRITICAL').length;
    const high = findings.filter((f) => f.severity === 'HIGH').length;
    return { total: findings.length, critical, high };
  }

  let total = 0;
  let critical = 0;
  let high = 0;

  const recurse = (n) => {
    if (!n.isFolder) {
      const findings = n.file?.findings || [];
      total += findings.length;
      critical += findings.filter((f) => f.severity === 'CRITICAL').length;
      high += findings.filter((f) => f.severity === 'HIGH').length;
    } else if (n.children) {
      n.children.forEach(recurse);
    }
  };

  node.children?.forEach(recurse);
  return { total, critical, high };
}

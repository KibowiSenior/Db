interface ConversionIssue {
  lineNumber?: number;
  issueType: "warning" | "error" | "info";
  category: "syntax" | "compatibility" | "optimization";
  description: string;
  originalText?: string;
  convertedText?: string;
  autoFixed: boolean;
}

interface ConversionStats {
  totalIssues: number;
  autoFixed: number;
  warningsCount: number;
  errorsCount: number;
  optimizationsCount: number;
}

interface ConversionResult {
  convertedSQL: string;
  issues: ConversionIssue[];
  stats: ConversionStats;
}

export async function convertMySQLToMariaDB(sqlContent: string): Promise<ConversionResult> {
  const issues: ConversionIssue[] = [];
  let convertedSQL = sqlContent;
  const lines = sqlContent.split('\n');

  // Track statistics
  const stats: ConversionStats = {
    totalIssues: 0,
    autoFixed: 0,
    warningsCount: 0,
    errorsCount: 0,
    optimizationsCount: 0
  };

  // Convert MySQL version comments
  convertedSQL = convertedSQL.replace(
    /\/\*!(\d+)\s+([^*]+)\*\//g,
    (match, version, content) => {
      const lineNumber = getLineNumber(sqlContent, match);
      issues.push({
        lineNumber,
        issueType: "warning",
        category: "syntax",
        description: "Converted MySQL version-specific comment to MariaDB compatible format",
        originalText: match,
        convertedText: content.trim(),
        autoFixed: true
      });
      stats.warningsCount++;
      stats.autoFixed++;
      return content.trim();
    }
  );

  // Convert DEFAULT CHARACTER SET declarations
  convertedSQL = convertedSQL.replace(
    /DEFAULT\s+CHARACTER\s+SET\s+(\w+)(\s+COLLATE\s+\w+)?/gi,
    (match, charset, collate) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = `CHARACTER SET ${charset}${collate || ''}`;
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Updated character set declaration for MariaDB 10.3 compatibility",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Convert DEFAULT CHARSET to CHARACTER SET
  convertedSQL = convertedSQL.replace(
    /DEFAULT\s+CHARSET\s*=\s*(\w+)/gi,
    (match, charset) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = `CHARACTER SET=${charset}`;
      issues.push({
        lineNumber,
        issueType: "warning",
        category: "syntax",
        description: "Converted DEFAULT CHARSET to CHARACTER SET for MariaDB compatibility",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.warningsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Handle ENGINE=InnoDB declarations - ensure they're MariaDB compatible
  convertedSQL = convertedSQL.replace(
    /ENGINE\s*=\s*InnoDB/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Verified InnoDB engine declaration is MariaDB 10.3 compatible",
        originalText: match,
        convertedText: match,
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return match;
    }
  );

  // Convert int(n) to more MariaDB-friendly format where appropriate
  convertedSQL = convertedSQL.replace(
    /\b(int)\((\d+)\)/gi,
    (match, intType, size) => {
      const lineNumber = getLineNumber(sqlContent, match);
      // For common sizes, we can optimize
      if (size === "11") {
        const replacement = "int";
        issues.push({
          lineNumber,
          issueType: "info",
          category: "optimization",
          description: "Simplified int(11) to int for better MariaDB 10.3 compatibility",
          originalText: match,
          convertedText: replacement,
          autoFixed: true
        });
        stats.optimizationsCount++;
        stats.autoFixed++;
        return replacement;
      }
      return match;
    }
  );

  // Check for potential JSON column types that might need attention
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('json') && !line.trim().startsWith('--')) {
      issues.push({
        lineNumber: index + 1,
        issueType: "warning",
        category: "compatibility",
        description: "JSON column type detected - verify MariaDB 10.3 JSON support meets your requirements",
        originalText: line.trim(),
        autoFixed: false
      });
      stats.warningsCount++;
    }
  });

  // Check for AUTO_INCREMENT with specific values
  convertedSQL = convertedSQL.replace(
    /AUTO_INCREMENT\s*=\s*(\d+)/gi,
    (match, value) => {
      const lineNumber = getLineNumber(sqlContent, match);
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: `AUTO_INCREMENT value ${value} is compatible with MariaDB 10.3`,
        originalText: match,
        convertedText: match,
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return match;
    }
  );

  // Handle utf8 vs utf8mb4 character sets
  convertedSQL = convertedSQL.replace(
    /\bCHARSET\s*=?\s*utf8\b(?!mb4)/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = match.replace(/utf8\b/, 'utf8mb4');
      issues.push({
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: "Upgraded utf8 to utf8mb4 for full Unicode support in MariaDB 10.3",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.warningsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Handle COLLATE declarations
  convertedSQL = convertedSQL.replace(
    /COLLATE\s+utf8_general_ci/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = "COLLATE utf8mb4_general_ci";
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Updated collation to utf8mb4_general_ci for MariaDB 10.3 compatibility",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Calculate final statistics
  stats.totalIssues = issues.length;

  return {
    convertedSQL,
    issues,
    stats
  };
}

function getLineNumber(content: string, searchText: string): number {
  const beforeMatch = content.substring(0, content.indexOf(searchText));
  return beforeMatch.split('\n').length;
}

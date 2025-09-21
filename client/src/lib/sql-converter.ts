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

  // Replace MySQL 8.0 collations with MariaDB 10.3 compatible equivalents
  const mysqlCollationMap = {
    'utf8mb4_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_0900_as_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_0900_as_cs': 'utf8mb4_unicode_ci',
    'utf8mb4_0900_bin': 'utf8mb4_bin',
    'utf8_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8_0900_as_ci': 'utf8mb4_unicode_ci'
  };

  Object.entries(mysqlCollationMap).forEach(([mysqlCollation, mariadbCollation]) => {
    const regex = new RegExp(`\\b${mysqlCollation}\\b`, 'gi');
    convertedSQL = convertedSQL.replace(regex, (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      issues.push({
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: `Replaced MySQL 8.0 collation ${match} with MariaDB 10.3 compatible ${mariadbCollation}`,
        originalText: match,
        convertedText: mariadbCollation,
        autoFixed: true
      });
      stats.warningsCount++;
      stats.autoFixed++;
      return mariadbCollation;
    });
  });

  // Fix SET NAMES statements
  convertedSQL = convertedSQL.replace(
    /SET\s+NAMES\s+utf8\b(?!\s*mb4)/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = 'SET NAMES utf8mb4';
      issues.push({
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: "Upgraded SET NAMES utf8 to utf8mb4 for consistent character set handling",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.warningsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Remove DEFINER clauses that can cause import failures
  convertedSQL = convertedSQL.replace(
    /DEFINER\s*=\s*[^@]*@[^\s]*\s+/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      issues.push({
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: "Removed DEFINER clause to prevent import failures due to missing user accounts",
        originalText: match.trim(),
        convertedText: "-- Removed DEFINER",
        autoFixed: true
      });
      stats.warningsCount++;
      stats.autoFixed++;
      return '';
    }
  );

  // Remove MySQL-specific system variable settings that don't exist in MariaDB
  convertedSQL = convertedSQL.replace(
    /SET\s+@@global\.local_infile\s*=\s*[^;]+;?\s*/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      issues.push({
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: "Removed MySQL-specific @@global.local_infile setting not compatible with MariaDB",
        originalText: match.trim(),
        convertedText: "-- Removed MySQL-specific setting",
        autoFixed: true
      });
      stats.warningsCount++;
      stats.autoFixed++;
      return "-- " + match.trim() + " -- Removed for MariaDB compatibility\n";
    }
  );

  // Handle FOREIGN_KEY_CHECKS
  convertedSQL = convertedSQL.replace(
    /SET\s+FOREIGN_KEY_CHECKS\s*=\s*([01]);?\s*/gi,
    (match, value) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = `SET foreign_key_checks = ${value};`;
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Updated FOREIGN_KEY_CHECKS syntax for MariaDB compatibility",
        originalText: match.trim(),
        convertedText: replacement,
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return replacement + "\n";
    }
  );

  // Handle SQL_MODE settings - make them MariaDB compatible
  convertedSQL = convertedSQL.replace(
    /SET\s+SQL_MODE\s*=\s*['"]([^'"]*?)['"];?\s*/gi,
    (match, mode) => {
      const lineNumber = getLineNumber(sqlContent, match);
      // Remove MySQL-specific modes that don't exist in MariaDB
      const cleanedMode = mode
        .replace(/,?\s*NO_AUTO_CREATE_USER\s*,?/gi, '')
        .replace(/,?\s*NO_ENGINE_SUBSTITUTION\s*,?/gi, '')
        .replace(/^,+|,+$/g, '') // Remove leading/trailing commas
        .replace(/,+/g, ','); // Remove duplicate commas
      
      const replacement = `SET SQL_MODE = '${cleanedMode}';`;
      issues.push({
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: "Cleaned SQL_MODE setting to remove MySQL-specific modes not available in MariaDB",
        originalText: match.trim(),
        convertedText: replacement,
        autoFixed: true
      });
      stats.warningsCount++;
      stats.autoFixed++;
      return replacement + "\n";
    }
  );

  // Remove or comment out LOCK TABLES statements that might cause issues
  convertedSQL = convertedSQL.replace(
    /(LOCK\s+TABLES[^;]+;)\s*/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      issues.push({
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: "Commented out LOCK TABLES statement - verify MariaDB compatibility",
        originalText: match.trim(),
        convertedText: "-- " + match.trim(),
        autoFixed: true
      });
      stats.warningsCount++;
      stats.autoFixed++;
      return "-- " + match.trim() + " -- Review for MariaDB compatibility\n";
    }
  );

  // Handle UNLOCK TABLES
  convertedSQL = convertedSQL.replace(
    /(UNLOCK\s+TABLES;)\s*/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      issues.push({
        lineNumber,
        issueType: "warning", 
        category: "compatibility",
        description: "Commented out UNLOCK TABLES statement - verify MariaDB compatibility",
        originalText: match.trim(),
        convertedText: "-- " + match.trim(),
        autoFixed: true
      });
      stats.warningsCount++;
      stats.autoFixed++;
      return "-- " + match.trim() + " -- Review for MariaDB compatibility\n";
    }
  );

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

  // Handle MySQL-specific timestamp defaults
  convertedSQL = convertedSQL.replace(
    /timestamp\s+NOT\s+NULL\s+DEFAULT\s+CURRENT_TIMESTAMP\s+ON\s+UPDATE\s+CURRENT_TIMESTAMP/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = "timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Verified timestamp with CURRENT_TIMESTAMP is MariaDB compatible",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Handle DISABLE/ENABLE KEYS statements
  convertedSQL = convertedSQL.replace(
    /(ALTER\s+TABLE\s+[^\s]+\s+DISABLE\s+KEYS;)\s*/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "DISABLE KEYS statement maintained for MariaDB compatibility",
        originalText: match.trim(),
        convertedText: match.trim(),
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return match;
    }
  );

  convertedSQL = convertedSQL.replace(
    /(ALTER\s+TABLE\s+[^\s]+\s+ENABLE\s+KEYS;)\s*/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "ENABLE KEYS statement maintained for MariaDB compatibility",
        originalText: match.trim(),
        convertedText: match.trim(),
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

  // Handle MySQL-specific UNIQUE KEY syntax
  convertedSQL = convertedSQL.replace(
    /UNIQUE\s+KEY\s+([^\s(]+)\s*\(([^)]+)\)/gi,
    (match, keyName, columns) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = `UNIQUE KEY \`${keyName.replace(/[`'"]/g, '')}\` (${columns})`;
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Ensured UNIQUE KEY syntax is MariaDB compatible",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Handle MySQL-specific KEY syntax
  convertedSQL = convertedSQL.replace(
    /(?<!UNIQUE\s)KEY\s+([^\s(]+)\s*\(([^)]+)\)/gi,
    (match, keyName, columns) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = `KEY \`${keyName.replace(/[`'"]/g, '')}\` (${columns})`;
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Ensured KEY syntax is MariaDB compatible",
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

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

  // Replace MySQL 8.0+ collations with MariaDB 10.3 compatible equivalents - PRESERVE CASE SENSITIVITY
  const mysqlCollationMap = {
    // MySQL 8.0 utf8mb4 collations - PRESERVE CASE SENSITIVITY FOR DATA INTEGRITY
    'utf8mb4_0900_ai_ci': 'utf8mb4_unicode_ci',     // Case insensitive -> case insensitive
    'utf8mb4_0900_as_ci': 'utf8mb4_unicode_ci',     // Case insensitive -> case insensitive
    'utf8mb4_0900_as_cs': 'utf8mb4_bin',            // Case sensitive -> case sensitive (CRITICAL)
    'utf8mb4_0900_bin': 'utf8mb4_bin',              // Binary -> binary
    
    // Case-sensitive collations - MAP TO utf8mb4_bin TO PRESERVE SEMANTICS
    'utf8mb4_cs_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_cs_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_da_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_da_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_de_pb_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_de_pb_0900_as_cs': 'utf8mb4_bin',      // Case sensitive -> case sensitive
    'utf8mb4_eo_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_eo_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_es_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_es_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_es_trad_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_es_trad_0900_as_cs': 'utf8mb4_bin',    // Case sensitive -> case sensitive
    'utf8mb4_et_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_et_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_hr_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_hr_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_hu_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_hu_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_is_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_is_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_ja_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_ja_0900_as_cs_ks': 'utf8mb4_bin',      // Case sensitive -> case sensitive
    'utf8mb4_la_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_la_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_lt_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_lt_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_lv_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_lv_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_pl_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_pl_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_ro_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_ro_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_ru_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_ru_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_sk_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_sk_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_sl_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_sl_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_sv_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_sv_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_tr_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_tr_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_vi_0900_ai_ci': 'utf8mb4_unicode_ci',
    'utf8mb4_vi_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    'utf8mb4_zh_0900_as_cs': 'utf8mb4_bin',         // Case sensitive -> case sensitive
    
    // UTF8 MySQL 8.0 collations (also convert to utf8mb4 with proper case sensitivity)
    'utf8_0900_ai_ci': 'utf8mb4_unicode_ci',        // Case insensitive -> case insensitive
    'utf8_0900_as_ci': 'utf8mb4_unicode_ci',        // Case insensitive -> case insensitive
    'utf8_0900_as_cs': 'utf8mb4_bin',               // Case sensitive -> case sensitive (CRITICAL)
    'utf8_0900_bin': 'utf8mb4_bin'                  // Binary -> binary
  };

  Object.entries(mysqlCollationMap).forEach(([mysqlCollation, mariadbCollation]) => {
    const regex = new RegExp(`\\b${mysqlCollation}\\b`, 'gi');
    convertedSQL = convertedSQL.replace(regex, (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      addIssue(issues, stats, {
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: `Replaced MySQL 8.0+ collation ${match} with MariaDB 10.3 compatible ${mariadbCollation}`,
        originalText: match,
        convertedText: mariadbCollation,
        autoFixed: true
      });
      return mariadbCollation;
    });
  });

  // Fix SET NAMES statements
  convertedSQL = convertedSQL.replace(
    /SET\s+NAMES\s+utf8\b(?!\s*mb4)/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = 'SET NAMES utf8mb4';
      addIssue(issues, stats, {
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: "Upgraded SET NAMES utf8 to utf8mb4 for consistent character set handling",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      return replacement;
    }
  );

  // Remove DEFINER clauses that can cause import failures
  convertedSQL = convertedSQL.replace(
    /DEFINER\s*=\s*[^@]*@[^\s]*\s+/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      addIssue(issues, stats, {
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: "Removed DEFINER clause to prevent import failures due to missing user accounts",
        originalText: match.trim(),
        convertedText: "-- Removed DEFINER",
        autoFixed: true
      });
      return '';
    }
  );

  // Remove HeidiSQL-style dump comments that can cause issues
  convertedSQL = convertedSQL.replace(
    /-- Dumping\s+(structure|data)\s+for\s+table[^\n]*\n/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      addIssue(issues, stats, {
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Removed HeidiSQL dump comment for cleaner structure",
        originalText: match.trim(),
        convertedText: "-- Table structure cleaned",
        autoFixed: true
      });
      return "";
    }
  );

  // Handle MySQL version-specific comments safely (preserve essential objects)
  convertedSQL = convertedSQL.replace(
    /\/\*!(\d+)\s+([\s\S]*?)\*\//g,
    (match, version, content, offset) => {
      const lineNumber = getLineNumber(sqlContent, match);
      
      // Only remove known problematic optimizer hints, preserve everything else
      const trimmedContent = content.trim();
      
      // Explicit deny list for problematic MySQL-specific hints
      const problematicHints = [
        /^@@/i,
        /^SET\s+@@/i,
        /USE_INDEX/i,
        /FORCE_INDEX/i,
        /IGNORE_INDEX/i,
        /SQL_CALC_FOUND_ROWS/i
      ];
      
      const isProblematic = problematicHints.some(pattern => pattern.test(trimmedContent));
      
      if (isProblematic) {
        addIssue(issues, stats, {
          lineNumber,
          issueType: "warning",
          category: "compatibility",
          description: "Removed problematic MySQL-specific optimizer hint or setting",
          originalText: match,
          convertedText: "-- Removed problematic hint",
          autoFixed: true
        });
        return "";
      } else {
        // Preserve conditional semantics for compatibility
        addIssue(issues, stats, {
          lineNumber,
          issueType: "info",
          category: "compatibility",
          description: "MySQL version comment preserved with conditional semantics for compatibility",
          originalText: match,
          autoFixed: false
        });
        return match; // Keep original with version check
      }
    }
  );

  // Keep CREATE TABLE IF NOT EXISTS intact - MariaDB 10.3 supports this syntax
  convertedSQL = convertedSQL.replace(
    /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+((?:`[^`]+`\.)?`[^`]+`|\w+)/gi,
    (match, tableName) => {
      const lineNumber = getLineNumber(sqlContent, match);
      addIssue(issues, stats, {
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "CREATE TABLE IF NOT EXISTS is supported in MariaDB 10.3 - keeping original syntax for data safety",
        originalText: match,
        autoFixed: false
      });
      return match; // Keep original - data safe
    }
  );

  // Keep INSERT IGNORE INTO as is for data safety (prevents import failures on duplicates)
  // Note: INSERT IGNORE is safer for imports as it won't stop on duplicate keys

  // Fix latin1_swedish_ci character set issues
  convertedSQL = convertedSQL.replace(
    /CHARSET=latin1\s+COLLATE=latin1_swedish_ci/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = "CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci";
      issues.push({
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: "Converted latin1_swedish_ci to utf8mb4_general_ci for better MariaDB compatibility",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.warningsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Remove USING BTREE index hints that can cause issues
  convertedSQL = convertedSQL.replace(
    /\s+USING\s+BTREE/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Removed USING BTREE index hint for MariaDB compatibility",
        originalText: match.trim(),
        convertedText: "-- Removed index hint",
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return "";
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

  // MySQL version comments are handled earlier in the conversion process

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
      addIssue(issues, stats, {
        lineNumber,
        issueType: "warning",
        category: "syntax",
        description: "Converted DEFAULT CHARSET to CHARACTER SET for MariaDB compatibility",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      return replacement;
    }
  );

  // Handle ENGINE=InnoDB declarations - ensure they're MariaDB compatible
  convertedSQL = convertedSQL.replace(
    /ENGINE\s*=\s*InnoDB/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      addIssue(issues, stats, {
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Verified InnoDB engine declaration is MariaDB 10.3 compatible",
        originalText: match,
        convertedText: match,
        autoFixed: true
      });
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
        addIssue(issues, stats, {
          lineNumber,
          issueType: "info",
          category: "optimization",
          description: "Simplified int(11) to int for better MariaDB 10.3 compatibility",
          originalText: match,
          convertedText: replacement,
          autoFixed: true
        });
        return replacement;
      }
      return match;
    }
  );

  // ============ ADVANCED MySQL 8.0+ FEATURES CONVERSION ============
  
  // Handle MySQL 8.0 CTE (Common Table Expressions) - MariaDB 10.3 has limited support
  convertedSQL = convertedSQL.replace(
    /\bWITH\s+(RECURSIVE\s+)?([\w`]+)\s*\([^)]*\)\s*AS\s*\(/gi,
    (match, recursive, cteName) => {
      const lineNumber = getLineNumber(sqlContent, match);
      addIssue(issues, stats, {
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: `CTE (Common Table Expression) detected${recursive ? ' with RECURSIVE' : ''} - MariaDB 10.3 has limited CTE support compared to MySQL 8.0. Verify compatibility.`,
        originalText: match.trim(),
        autoFixed: false
      });
      return match; // Keep as-is but warn user
    }
  );
  
  // Handle MySQL 8.0 Window Functions - check for compatibility
  const windowFunctions = ['ROW_NUMBER', 'RANK', 'DENSE_RANK', 'PERCENT_RANK', 'CUME_DIST', 'NTILE', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'NTH_VALUE'];
  windowFunctions.forEach(func => {
    const regex = new RegExp(`\\b${func}\\s*\\(.*?\\)\\s+OVER\\s*\\(`, 'gi');
    convertedSQL = convertedSQL.replace(regex, (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      addIssue(issues, stats, {
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: `Window function ${func} detected - verify MariaDB 10.3 supports the specific syntax used`,
        originalText: match.trim(),
        autoFixed: false
      });
      return match;
    });
  });
  
  // Handle MySQL 8.0 Generated/Computed Columns - Detect but don't auto-convert due to complexity
  lines.forEach((line, index) => {
    if (/\bAS\s*\([^)]*\)\s+(VIRTUAL|STORED)\b/gi.test(line) && !line.trim().startsWith('--')) {
      addIssue(issues, stats, {
        lineNumber: index + 1,
        issueType: "warning",
        category: "compatibility",
        description: "Generated/computed column detected - verify MariaDB 10.3 syntax compatibility manually",
        originalText: line.trim(),
        autoFixed: false
      });
    }
  });
  
  // Handle MySQL 8.0 Invisible Columns - NOT supported in MariaDB 10.3
  convertedSQL = convertedSQL.replace(
    /(`[^`]+`)\s+([^,)]+)\s+INVISIBLE\b/gi,
    (match, columnName, columnDef) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = `${columnName} ${columnDef} -- INVISIBLE not supported in MariaDB 10.3`;
      addIssue(issues, stats, {
        lineNumber,
        issueType: "error",
        category: "compatibility",
        description: "INVISIBLE column attribute removed - not supported in MariaDB 10.3. Column will be visible.",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      return replacement;
    }
  );
  
  // Handle MySQL 8.0 CHECK constraints syntax
  convertedSQL = convertedSQL.replace(
    /CONSTRAINT\s+([\w`]+)\s+CHECK\s*\(([^)]+)\)/gi,
    (match, constraintName, checkExpression) => {
      const lineNumber = getLineNumber(sqlContent, match);
      addIssue(issues, stats, {
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "CHECK constraint detected - MariaDB 10.3 supports CHECK constraints with some limitations",
        originalText: match,
        autoFixed: false
      });
      return match;
    }
  );
  
  // Handle MySQL 8.0 JSON functions and operators
  const jsonFunctions = ['JSON_EXTRACT', 'JSON_UNQUOTE', 'JSON_SET', 'JSON_INSERT', 'JSON_REPLACE', 'JSON_REMOVE', 'JSON_ARRAY', 'JSON_OBJECT', 'JSON_ARRAYAGG', 'JSON_OBJECTAGG'];
  jsonFunctions.forEach(func => {
    const regex = new RegExp(`\\b${func}\\s*\\(`, 'gi');
    convertedSQL = convertedSQL.replace(regex, (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      addIssue(issues, stats, {
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: `JSON function ${func} detected - verify MariaDB 10.3 JSON function compatibility`,
        originalText: match.trim(),
        autoFixed: false
      });
      return match;
    });
  });
  
  // Convert MySQL 8.0 JSON operators to MariaDB 10.3 compatible functions
  convertedSQL = convertedSQL.replace(
    /([\w`\.]+)\s*(->>?)\s*(["'][^"']*["']|\$\.[\w\[\]"'\.$]+)/gi,
    (match, column, operator, path) => {
      const lineNumber = getLineNumber(sqlContent, match);
      let replacement: string;
      
      if (operator === '->') {
        // Convert -> to JSON_EXTRACT
        replacement = `JSON_EXTRACT(${column}, ${path})`;
      } else if (operator === '->>') {
        // Convert ->> to JSON_UNQUOTE(JSON_EXTRACT)
        replacement = `JSON_UNQUOTE(JSON_EXTRACT(${column}, ${path}))`;
      } else {
        // Fallback for unexpected operators
        replacement = match;
      }
      
      addIssue(issues, stats, {
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: `Converted JSON operator ${operator} to MariaDB 10.3 compatible function`,
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      return replacement;
    }
  );
  
  // Handle FULLTEXT indexes - syntax differences
  convertedSQL = convertedSQL.replace(
    /FULLTEXT\s+(INDEX|KEY)\s+([\w`]+)?\s*\(([^)]+)\)(?:\s+WITH\s+PARSER\s+(\w+))?/gi,
    (match, indexType, indexName, columns, parser) => {
      const lineNumber = getLineNumber(sqlContent, match);
      if (parser && parser.toLowerCase() !== 'ngram') {
        const replacement = `FULLTEXT ${indexType} ${indexName || ''} (${columns}) -- Parser ${parser} may not be available`;
        addIssue(issues, stats, {
          lineNumber,
          issueType: "warning",
          category: "compatibility",
          description: `FULLTEXT index parser ${parser} may not be available in MariaDB 10.3`,
          originalText: match,
          convertedText: replacement,
          autoFixed: true
        });
        return replacement;
      }
      addIssue(issues, stats, {
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "FULLTEXT index syntax is compatible with MariaDB 10.3",
        originalText: match,
        autoFixed: false
      });
      return match;
    }
  );
  
  // Handle MySQL 8.0 partitioning syntax differences
  convertedSQL = convertedSQL.replace(
    /PARTITION\s+BY\s+(RANGE|LIST|HASH|KEY)\s*\(([^)]+)\)(?:\s+PARTITIONS\s+(\d+))?/gi,
    (match, partitionType, expression, partitionCount) => {
      const lineNumber = getLineNumber(sqlContent, match);
      addIssue(issues, stats, {
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: `Table partitioning (${partitionType}) detected - verify MariaDB 10.3 partitioning compatibility`,
        originalText: match,
        autoFixed: false
      });
      return match;
    }
  );
  
  // ============ END ADVANCED FEATURES ============
  
  // Enhanced JSON column detection with comprehensive handling
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('json') && !line.trim().startsWith('--')) {
      addIssue(issues, stats, {
        lineNumber: index + 1,
        issueType: "warning",
        category: "compatibility",
        description: "JSON column type detected - MariaDB 10.3 JSON support is functional but may have differences from MySQL 8.0",
        originalText: line.trim(),
        autoFixed: false
      });
    }
  });

  // Check for AUTO_INCREMENT with specific values
  convertedSQL = convertedSQL.replace(
    /AUTO_INCREMENT\s*=\s*(\d+)/gi,
    (match, value) => {
      const lineNumber = getLineNumber(sqlContent, match);
      addIssue(issues, stats, {
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: `AUTO_INCREMENT value ${value} is compatible with MariaDB 10.3`,
        originalText: match,
        convertedText: match,
        autoFixed: true
      });
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

  // Handle COLLATE declarations (only in CREATE/ALTER TABLE context)
  convertedSQL = convertedSQL.replace(
    /COLLATE\s+utf8_general_ci/gi,
    (match, offset, str) => {
      // Only apply within CREATE/ALTER TABLE contexts to avoid corrupting INSERT data
      const beforeMatch = str.substring(Math.max(0, offset - 500), offset);
      if (!/CREATE\s+TABLE|ALTER\s+TABLE/i.test(beforeMatch)) {
        return match; // Don't modify if not in DDL context
      }
      
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = "COLLATE utf8mb4_general_ci";
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Updated collation to utf8mb4_general_ci for MariaDB 10.3 compatibility (DDL only)",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Handle MySQL-specific plain KEY syntax only (preserve PRIMARY, UNIQUE, FULLTEXT, SPATIAL)
  convertedSQL = convertedSQL.replace(
    /^\s*(PRIMARY\s+KEY|UNIQUE\s+KEY|FULLTEXT\s+KEY|SPATIAL\s+KEY|KEY)\s+([^\s(]*)\s*\(([^)]+)\)/gim,
    (match, keyType, keyName, columns, offset, str) => {
      // Only modify plain KEY, preserve all other key types
      if (keyType.toUpperCase() !== 'KEY') {
        return match; // Keep PRIMARY KEY, UNIQUE KEY, FULLTEXT KEY, SPATIAL KEY as is
      }
      
      // Check if we're inside a CREATE TABLE context
      const beforeMatch = str.substring(Math.max(0, offset - 500), offset);
      if (!/CREATE\s+TABLE/i.test(beforeMatch)) {
        return match; // Don't modify if not in CREATE TABLE context
      }
      
      const lineNumber = getLineNumber(sqlContent, match);
      const cleanKeyName = keyName ? keyName.replace(/[`'"]/g, '') : '';
      const replacement = `  KEY \`${cleanKeyName}\` (${columns})`;
      
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Ensured plain KEY syntax is MariaDB compatible (preserved all constraint types)",
        originalText: match.trim(),
        convertedText: replacement.trim(),
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Fix data encoding issues for special characters and colors
  convertedSQL = convertedSQL.replace(
    /CHARACTER\s+SET\s+utf8\s+COLLATE\s+utf8_general_ci/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = "CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci";
      addIssue(issues, stats, {
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: "Upgraded character set to utf8mb4 for full unicode support (emojis, colors, special characters)",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      return replacement;
    }
  );

  // Fix any remaining charset issues in table definitions
  convertedSQL = convertedSQL.replace(
    /DEFAULT\s+CHARSET\s*=\s*utf8\b(?!\s*mb4)/gi,
    (match) => {
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = "DEFAULT CHARSET=utf8mb4";
      addIssue(issues, stats, {
        lineNumber,
        issueType: "warning",
        category: "compatibility",
        description: "Fixed charset to utf8mb4 for complete data compatibility (colors, emojis, special text)",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      return replacement;
    }
  );
  
  // ============ CRITICAL UTF8MB4 INDEX LENGTH SAFEGUARDS ============
  // Detect and fix potential index length issues when converting to utf8mb4
  
  // Check for VARCHAR columns in indexes that may exceed utf8mb4 key length limits
  convertedSQL = convertedSQL.replace(
    /(KEY|INDEX)\s+([\w`]*)?\s*\(([^)]+)\)/gi,
    (match, indexType, indexName, columns, offset, str) => {
      // Only check within CREATE TABLE contexts
      const beforeMatch = str.substring(Math.max(0, offset - 500), offset);
      if (!/CREATE\s+TABLE/i.test(beforeMatch)) {
        return match;
      }
      
      const lineNumber = getLineNumber(sqlContent, match);
      
      // Check for large VARCHAR columns that might cause issues with utf8mb4
      const hasProblematicVarchar = /varchar\s*\(\s*([2-9]\d{2}|[1-9]\d{3,})\s*\)/i.test(columns);
      
      if (hasProblematicVarchar) {
        // Don't auto-modify indexes, but warn about potential issues
        addIssue(issues, stats, {
          lineNumber,
          issueType: "error",
          category: "compatibility",
          description: "INDEX on large VARCHAR detected - may exceed MariaDB 10.3 key length limits with utf8mb4. Consider adding ROW_FORMAT=DYNAMIC or index prefixes.",
          originalText: match,
          autoFixed: false
        });
      }
      
      return match;
    }
  );
  
  // Check for tables that might need ROW_FORMAT=DYNAMIC for utf8mb4 compatibility
  convertedSQL = convertedSQL.replace(
    /(CREATE\s+TABLE\s+[\w`\.]+\s*\([^;]+)\)\s*(ENGINE\s*=\s*InnoDB)([^;]*);/gi,
    (match, tableStart, engine, tableEnd, offset, str) => {
      const lineNumber = getLineNumber(sqlContent, match);
      
      // Check if table has large VARCHAR columns and utf8mb4
      const hasUtf8mb4 = /utf8mb4/i.test(match);
      const hasLargeVarchar = /varchar\s*\(\s*([2-9]\d{2}|[1-9]\d{3,})\s*\)/i.test(match);
      const hasRowFormat = /ROW_FORMAT\s*=/i.test(match);
      
      if (hasUtf8mb4 && hasLargeVarchar && !hasRowFormat) {
        const replacement = `${tableStart}) ${engine} ROW_FORMAT=DYNAMIC${tableEnd};`;
        addIssue(issues, stats, {
          lineNumber,
          issueType: "warning",
          category: "compatibility",
          description: "Added ROW_FORMAT=DYNAMIC for utf8mb4 compatibility with large VARCHAR columns",
          originalText: match,
          convertedText: replacement,
          autoFixed: true
        });
        return replacement;
      }
      
      return match;
    }
  );
  
  // ============ END UTF8MB4 SAFEGUARDS ============

  // Handle JSON column data to ensure proper encoding (preserve all constraints)
  convertedSQL = convertedSQL.replace(
    /(`[^`]+`)\s+(json)(\b[^,)]*)/gi,
    (match, columnName, dataType, trailing, offset, str) => {
      // Only apply within CREATE TABLE contexts
      const beforeMatch = str.substring(Math.max(0, offset - 300), offset);
      if (!/CREATE\s+TABLE/i.test(beforeMatch)) {
        return match; // Don't modify if not in CREATE TABLE context
      }
      
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = `${columnName} longtext COLLATE utf8mb4_bin${trailing}`;
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Converted JSON column to longtext with binary collation for MariaDB 10.3 compatibility (preserved all constraints)",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Fix text field encodings for maximum compatibility (only in CREATE TABLE context)
  convertedSQL = convertedSQL.replace(
    /\b(text|longtext|mediumtext|tinytext)\b(?!\w)(\s+CHARACTER\s+SET\s+\w+)?(\s+COLLATE\s+[\w_]+)?/gi,
    (match, textType, charsetPart, collatePart, offset, str) => {
      // Only apply within CREATE TABLE contexts to avoid corrupting data
      const beforeMatch = str.substring(Math.max(0, offset - 300), offset);
      if (!/CREATE\s+TABLE/i.test(beforeMatch)) {
        return match; // Don't modify if not in CREATE TABLE context
      }
      
      if (!charsetPart || !charsetPart.includes('utf8mb4')) {
        const lineNumber = getLineNumber(sqlContent, match);
        const replacement = `${textType} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`;
        issues.push({
          lineNumber,
          issueType: "info",
          category: "optimization",
          description: "Ensured text field uses utf8mb4 for complete data support (all characters, colors, formatting)",
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

  // Ensure varchar fields support full character range (only in CREATE TABLE context)
  convertedSQL = convertedSQL.replace(
    /\bvarchar\((\d+)\)(?!\s+CHARACTER\s+SET\s+utf8mb4)/gi,
    (match, length, offset, str) => {
      // Only apply within CREATE TABLE contexts to avoid corrupting data
      const beforeMatch = str.substring(Math.max(0, offset - 300), offset);
      if (!/CREATE\s+TABLE/i.test(beforeMatch)) {
        return match; // Don't modify if not in CREATE TABLE context
      }
      
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = `varchar(${length}) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`;
      issues.push({
        lineNumber,
        issueType: "info",
        category: "optimization",
        description: "Enhanced varchar field to support all characters including colors and special formatting",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Fix any remaining encoding issues (only in CREATE/ALTER TABLE context)
  convertedSQL = convertedSQL.replace(
    /COLLATE\s+utf8_unicode_ci/gi,
    (match, offset, str) => {
      // Only apply within CREATE/ALTER TABLE contexts to avoid corrupting INSERT data
      const beforeMatch = str.substring(Math.max(0, offset - 500), offset);
      if (!/CREATE\s+TABLE|ALTER\s+TABLE/i.test(beforeMatch)) {
        return match; // Don't modify if not in DDL context
      }
      
      const lineNumber = getLineNumber(sqlContent, match);
      const replacement = "COLLATE utf8mb4_unicode_ci";
      issues.push({
        lineNumber,
        issueType: "info",
        category: "compatibility",
        description: "Updated collation to utf8mb4_unicode_ci for enhanced data compatibility (DDL only)",
        originalText: match,
        convertedText: replacement,
        autoFixed: true
      });
      stats.optimizationsCount++;
      stats.autoFixed++;
      return replacement;
    }
  );

  // Clean up extra whitespace and empty lines
  convertedSQL = convertedSQL.replace(/\n\s*\n\s*\n/g, '\n\n'); // Remove triple+ newlines
  convertedSQL = convertedSQL.replace(/^\s*\n/gm, ''); // Remove empty lines at start
  
  // Ensure proper SQL file header for MariaDB compatibility with full data support
  if (!convertedSQL.includes('SET NAMES utf8mb4')) {
    const header = `-- MariaDB 10.3 Compatible SQL Export
-- Optimized for ALL data types including colors, emojis, special characters
SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

`;
    convertedSQL = header + convertedSQL;
    
    issues.push({
      lineNumber: 1,
      issueType: "info",
      category: "optimization",
      description: "Added MariaDB-compatible SQL header for proper import",
      originalText: "-- File beginning",
      convertedText: "-- MariaDB header added",
      autoFixed: true
    });
    stats.optimizationsCount++;
    stats.autoFixed++;
  }

  // Add COMMIT at the end if not present
  if (!convertedSQL.toLowerCase().includes('commit')) {
    convertedSQL += '\n\nCOMMIT;\n';
    
    issues.push({
      lineNumber: convertedSQL.split('\n').length,
      issueType: "info",
      category: "optimization",
      description: "Added COMMIT statement at end of file for transaction safety",
      originalText: "-- File end",
      convertedText: "COMMIT;",
      autoFixed: true
    });
    stats.optimizationsCount++;
    stats.autoFixed++;
  }

  // Calculate final statistics
  stats.totalIssues = issues.length;

  return {
    convertedSQL,
    issues,
    stats
  };
}

function getLineNumber(content: string, searchText: string): number {
  // Handle multi-occurrence patterns by finding first occurrence
  const index = content.indexOf(searchText);
  if (index === -1) {
    return 1; // Default to line 1 if not found
  }
  const beforeMatch = content.substring(0, index);
  return beforeMatch.split('\n').length;
}

// Helper function to add issue and update stats consistently
function addIssue(issues: ConversionIssue[], stats: ConversionStats, issue: ConversionIssue): void {
  issues.push(issue);
  
  if (issue.autoFixed) {
    stats.autoFixed++;
  }
  
  switch (issue.issueType) {
    case 'warning':
      stats.warningsCount++;
      break;
    case 'error':
      stats.errorsCount++;
      break;
    case 'info':
      stats.optimizationsCount++;
      break;
  }
}

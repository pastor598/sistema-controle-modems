/**
 * CSV Parser Robusto - ModemControl Pro
 * Lida com campos que contém vírgulas, aspas e quebras de linha
 */

class CSVParser {
    /**
     * Parse CSV text to array of objects
     * @param {string} csvText - Raw CSV text
     * @param {object} options - Parser options
     * @returns {Array} Array of objects
     */
    static parse(csvText, options = {}) {
        const {
            delimiter = ',',
            quote = '"',
            escape = '"',
            skipEmptyLines = true,
            trimValues = true
        } = options;

        if (!csvText || typeof csvText !== 'string') {
            return [];
        }

        const lines = this.splitLines(csvText);
        if (lines.length === 0) {
            return [];
        }

        // Parse header
        const headers = this.parseLine(lines[0], delimiter, quote, escape);
        if (headers.length === 0) {
            return [];
        }

        const records = [];
        
        // Parse data lines
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            
            if (skipEmptyLines && !line.trim()) {
                continue;
            }

            const values = this.parseLine(line, delimiter, quote, escape);
            
            // Create object from headers and values
            const record = {};
            headers.forEach((header, index) => {
                const value = values[index] || '';
                record[trimValues ? header.trim() : header] = trimValues ? value.trim() : value;
            });

            records.push(record);
        }

        return records;
    }

    /**
     * Convert array of objects to CSV
     * @param {Array} data - Array of objects
     * @param {object} options - Options
     * @returns {string} CSV string
     */
    static stringify(data, options = {}) {
        const {
            delimiter = ',',
            quote = '"',
            escape = '"',
            headers = null,
            includeHeaders = true
        } = options;

        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }

        // Get headers
        const fieldNames = headers || Object.keys(data[0]);
        const rows = [];

        // Add headers if requested
        if (includeHeaders) {
            rows.push(this.formatRow(fieldNames, delimiter, quote, escape));
        }

        // Add data rows
        data.forEach(record => {
            const values = fieldNames.map(field => {
                const value = record[field];
                return value !== null && value !== undefined ? String(value) : '';
            });
            rows.push(this.formatRow(values, delimiter, quote, escape));
        });

        return rows.join('\n');
    }

    /**
     * Split CSV text into lines, handling quoted fields with newlines
     * @param {string} text - CSV text
     * @returns {Array} Array of lines
     */
    static splitLines(text) {
        const lines = [];
        let currentLine = '';
        let inQuotes = false;
        let i = 0;

        while (i < text.length) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (char === '"') {
                if (nextChar === '"') {
                    // Escaped quote
                    currentLine += '""';
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    currentLine += char;
                    i++;
                }
            } else if ((char === '\n' || char === '\r') && !inQuotes) {
                // End of line
                if (currentLine.trim()) {
                    lines.push(currentLine);
                }
                currentLine = '';
                
                // Skip \r\n
                if (char === '\r' && nextChar === '\n') {
                    i += 2;
                } else {
                    i++;
                }
            } else {
                currentLine += char;
                i++;
            }
        }

        // Add last line if exists
        if (currentLine.trim()) {
            lines.push(currentLine);
        }

        return lines;
    }

    /**
     * Parse a single CSV line
     * @param {string} line - CSV line
     * @param {string} delimiter - Field delimiter
     * @param {string} quote - Quote character
     * @param {string} escape - Escape character
     * @returns {Array} Array of field values
     */
    static parseLine(line, delimiter = ',', quote = '"', escape = '"') {
        const fields = [];
        let currentField = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === quote) {
                if (inQuotes && nextChar === quote) {
                    // Escaped quote
                    currentField += quote;
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === delimiter && !inQuotes) {
                // Field separator
                fields.push(currentField);
                currentField = '';
                i++;
            } else {
                currentField += char;
                i++;
            }
        }

        // Add last field
        fields.push(currentField);

        return fields;
    }

    /**
     * Format a row for CSV output
     * @param {Array} values - Field values
     * @param {string} delimiter - Field delimiter
     * @param {string} quote - Quote character
     * @param {string} escape - Escape character
     * @returns {string} Formatted CSV row
     */
    static formatRow(values, delimiter = ',', quote = '"', escape = '"') {
        return values.map(value => {
            const stringValue = String(value);
            
            // Check if quoting is needed
            const needsQuoting = stringValue.includes(delimiter) || 
                                stringValue.includes(quote) || 
                                stringValue.includes('\n') || 
                                stringValue.includes('\r');

            if (needsQuoting) {
                // Escape quotes and wrap in quotes
                const escapedValue = stringValue.replace(new RegExp(quote, 'g'), escape + quote);
                return quote + escapedValue + quote;
            }

            return stringValue;
        }).join(delimiter);
    }

    /**
     * Validate CSV structure
     * @param {string} csvText - CSV text to validate
     * @returns {object} Validation result
     */
    static validate(csvText) {
        try {
            const lines = this.splitLines(csvText);
            
            if (lines.length === 0) {
                return { valid: false, error: 'CSV vazio' };
            }

            const headers = this.parseLine(lines[0]);
            if (headers.length === 0) {
                return { valid: false, error: 'Cabeçalho inválido' };
            }

            // Check for duplicate headers
            const uniqueHeaders = new Set(headers);
            if (uniqueHeaders.size !== headers.length) {
                return { valid: false, error: 'Cabeçalhos duplicados encontrados' };
            }

            // Validate data rows
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseLine(lines[i]);
                if (values.length !== headers.length) {
                    return { 
                        valid: false, 
                        error: `Linha ${i + 1}: número de campos não corresponde ao cabeçalho` 
                    };
                }
            }

            return { 
                valid: true, 
                rowCount: lines.length - 1, 
                columnCount: headers.length,
                headers: headers
            };

        } catch (error) {
            return { valid: false, error: error.message };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVParser;
} else {
    window.CSVParser = CSVParser;
} 
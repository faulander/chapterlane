/**
 * Simple CSV parser that handles quoted fields with commas and newlines.
 */
export function parseCSV(text: string): Record<string, string>[] {
	const lines = splitCSVLines(text);
	if (lines.length < 2) return [];

	const headers = parseCSVRow(lines[0]).map((h) => h.trim());
	const rows: Record<string, string>[] = [];

	for (let i = 1; i < lines.length; i++) {
		const values = parseCSVRow(lines[i]);
		if (values.length === 0 || (values.length === 1 && values[0].trim() === '')) continue;

		const row: Record<string, string> = {};
		for (let j = 0; j < headers.length; j++) {
			row[headers[j]] = (values[j] ?? '').trim();
		}
		rows.push(row);
	}

	return rows;
}

function splitCSVLines(text: string): string[] {
	const lines: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const char = text[i];

		if (char === '"') {
			if (inQuotes && text[i + 1] === '"') {
				current += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
				current += char;
			}
		} else if ((char === '\n' || char === '\r') && !inQuotes) {
			if (char === '\r' && text[i + 1] === '\n') i++;
			if (current.trim()) lines.push(current);
			current = '';
		} else {
			current += char;
		}
	}

	if (current.trim()) lines.push(current);
	return lines;
}

function parseCSVRow(line: string): string[] {
	const values: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			values.push(current);
			current = '';
		} else {
			current += char;
		}
	}

	values.push(current);
	return values;
}

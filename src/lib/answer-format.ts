/**
 * The fine-tuned model opens every answer with a citation line, e.g.
 *
 *   According to Law: National Penal Code 2017, Chapter: Offences Relating to
 *   Theft and Robbery, Section: 241 - Prohibition of theft:
 *
 * followed by the explanation. These helpers turn that into structured data and
 * tidy the body (the model writes numbered lists inline in a single paragraph).
 */

export type Citation = {
  law: string;
  division?: { label: string; value: string };
  provision?: { label: string; number: string; title?: string };
};

export type ParsedAnswer = {
  citation: Citation | null;
  /** The answer is still streaming its citation line. */
  citationPending: boolean;
  body: string;
};

const LEAD = /^(?:according to|under) (?:the )?law\s*:/i;
/** The model has written both forms. */
const LEAD_TEXTS = ["according to law:", "under law:"];
const KEYED_PART = /,\s*(?=(?:chapter|part|section|article|rule|clause|schedule)\s*:)/i;

export function parseAnswer(text: string, complete: boolean): ParsedAnswer {
  const trimmed = text.trimStart();

  if (!complete && trimmed.length > 0 && LEAD_TEXTS.some((lead) => lead.startsWith(trimmed.toLowerCase()))) {
    return { citation: null, citationPending: true, body: "" };
  }
  if (!LEAD.test(trimmed)) {
    return { citation: null, citationPending: false, body: trimmed };
  }

  const lineEnd = trimmed.indexOf("\n");
  if (lineEnd === -1 && !complete) {
    return { citation: null, citationPending: true, body: "" };
  }

  const line = lineEnd === -1 ? trimmed : trimmed.slice(0, lineEnd);
  const citation = parseCitationLine(line);
  if (!citation) return { citation: null, citationPending: false, body: trimmed };

  return {
    citation,
    citationPending: false,
    body: lineEnd === -1 ? "" : trimmed.slice(lineEnd + 1).trim(),
  };
}

function parseCitationLine(line: string): Citation | null {
  const content = line.replace(LEAD, "").trim().replace(/:\s*$/, "");
  const [law, ...parts] = content.split(KEYED_PART);
  if (!law?.trim()) return null;

  const citation: Citation = { law: law.trim() };
  for (const part of parts) {
    const colon = part.indexOf(":");
    const label = capitalize(part.slice(0, colon).trim());
    const value = part.slice(colon + 1).trim();
    if (!value) continue;

    if (/^(section|article|rule|clause)$/i.test(label)) {
      const match = value.match(/^([\w().\/]+?)\s*[-–—]\s*(.+)$/);
      citation.provision = match
        ? { label, number: match[1], title: match[2].trim() }
        : { label, number: value };
    } else {
      citation.division = { label, value };
    }
  }
  return citation;
}

/** Plain-text form of a citation, e.g. for copying. */
export function formatCitation(citation: Citation): string {
  const parts = [citation.law];
  if (citation.division) parts.push(`${citation.division.label} ${citation.division.value}`);
  if (citation.provision) {
    const { label, number, title } = citation.provision;
    parts.push(`${label} ${number}${title ? ` (${title})` : ""}`);
  }
  return parts.join(" › ");
}

/**
 * Turn "These rights include: 1. Peace: … 2. Privacy: …" into a real Markdown
 * list. Only fires for sequential markers starting at 1, so stray numbers in
 * prose are left alone.
 */
export function reflowLists(markdown: string): string {
  return markdown
    .split(/\n{2,}/)
    .map(reflowParagraph)
    .join("\n\n");
}

const MARKER = /(^|[\s:;])(\d{1,2})\.\s+(?=[^\s\d])/g;

function reflowParagraph(paragraph: string): string {
  const marks: { at: number; contentStart: number }[] = [];
  let expected = 1;
  for (const match of paragraph.matchAll(MARKER)) {
    if (Number(match[2]) !== expected) continue;
    const at = (match.index ?? 0) + match[1].length;
    marks.push({ at, contentStart: (match.index ?? 0) + match[0].length });
    expected += 1;
  }
  if (marks.length < 2) return paragraph;

  const intro = paragraph.slice(0, marks[0].at).trim();
  const items = marks.map((mark, i) =>
    paragraph.slice(mark.contentStart, marks[i + 1]?.at).trim(),
  );
  const list = items.map((item, i) => `${i + 1}. ${emphasizeLead(item)}`).join("\n");
  return intro ? `${intro}\n\n${list}` : list;
}

/** "The right to privacy: This means…" → "**The right to privacy:** This means…" */
function emphasizeLead(item: string): string {
  const match = item.match(/^([^:.!?\n*]{2,70}):\s+(\S[\s\S]*)$/);
  return match ? `**${match[1].trim()}:** ${match[2]}` : item;
}

/** The engine has a generation limit, so long answers can stop mid-sentence. */
export function looksTruncated(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && !/[.!?)"'”’»*_`\]]$/.test(trimmed);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

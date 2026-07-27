/**
 * Clean and paragraph scraped article text for comfortable reading.
 */

const JUNK_PREFIXES = [
  /^NEW\s*You can now listen to Fox News articles!\s*/i,
  /^You can now listen to Fox News articles!\s*/i,
];

function insertMissingSpaces(text: string): string {
  return (
    text
      // ALLCAPS acronym stuck to Titlecase: BBCIshbel → BBC Ishbel
      .replace(/\b([A-Z]{2,})([A-Z][a-z])/g, "$1 $2")
      // lowercase/digit glued to Capital word: IranA → Iran A
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      // closing quote glued to next word: "fear"and → "fear" and
      .replace(/(["”])([A-Za-z])/g, "$1 $2")
      // closing paren glued to next word
      .replace(/(\))([A-Za-z])/g, "$1 $2")
      // period glued to opening quote: possible."I → possible. "I
      .replace(/([.!?])(["“])/g, "$1 $2")
      // keep opening quotes tight (not spaces after closing quotes)
      .replace(/(^|[\s([{])(["“])\s+/g, "$1$2")
      .replace(/ {2,}/g, " ")
  );
}

/** Add periods where scrapers dropped them between sentences. */
function restoreSentenceBoundaries(text: string): string {
  return (
    text
      .replace(/([.!?])([A-Z])/g, "$1 $2")
      // "Iran A woman" / "Wednesday Neither has"
      .replace(
        /([a-z]) (A|An|The|She|He|They|It|Neither|Both|This|That|These|Those|However) /g,
        "$1. $2 ",
      )
      .replace(/ {2,}/g, " ")
  );
}

function stripJunkPrefix(text: string): string {
  let out = text;
  for (const pattern of JUNK_PREFIXES) {
    out = out.replace(pattern, "");
  }
  return out.trim();
}

function stripLeadingByline(text: string): string {
  const roleMatch = text.match(
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\s+(?:Chief|Senior|International|Middle East|Foreign|Political|Diplomatic)\b[^.]{0,60}?\b(?:Correspondent|Editor|Reporter|Presenter)\b(?:,\s*[A-Z][A-Za-z]{1,20})?\.?\s+/,
  );
  if (roleMatch) {
    return text.slice(roleMatch[0].length).trim();
  }

  const locMatch = text.match(
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\s+(?:West Midlands|London|Washington|Tehran|Jerusalem|Beirut|New York)\s+(?:BBC|Fox News)?\s*/,
  );
  if (locMatch && locMatch[0].length < 80) {
    return text.slice(locMatch[0].length).trim();
  }

  const bbcLead = text.match(/^BBC\s+/);
  if (bbcLead) {
    return text.slice(bbcLead[0].length).trim();
  }

  return text;
}

function stripTrailingBoilerplate(text: string): string {
  const foxBio = text.search(
    /\b(?:is|was) (?:the |a )?(?:host|anchor|media critic|chief|correspondent).{0,80}(?:Fox News|FOX News)/i,
  );
  if (foxBio > text.length * 0.55) {
    return text
      .slice(0, foxBio)
      .replace(/\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*$/, "")
      .trim();
  }

  const bbcNote = text.search(
    /\b(?:These restrictions apply|is reporting from .+ on condition that)/i,
  );
  if (bbcNote > text.length * 0.7) {
    return text.slice(0, bbcNote).trim();
  }

  return text;
}

function splitSentences(text: string): string[] {
  const parts: string[] = [];
  let buffer = "";

  for (let i = 0; i < text.length; i += 1) {
    buffer += text[i];

    const afterSpace = text.slice(i + 1).match(/^\s+(["“]?[A-Z])/);
    if (/[.!?]["']?$/.test(buffer.trimEnd()) && afterSpace) {
      parts.push(buffer.trim());
      buffer = "";
      while (text[i + 1] === " ") i += 1;
    }
  }

  if (buffer.trim()) parts.push(buffer.trim());
  return parts.length ? parts : [text];
}

function groupIntoParagraphs(sentences: string[]): string[] {
  const paragraphs: string[] = [];
  let bucket: string[] = [];
  let chars = 0;

  const flush = () => {
    if (!bucket.length) return;
    paragraphs.push(bucket.join(" "));
    bucket = [];
    chars = 0;
  };

  for (const sentence of sentences) {
    if (paragraphs.length === 0 && bucket.length === 1 && chars > 90) {
      flush();
    }

    bucket.push(sentence);
    chars += sentence.length;

    const endsWithQuote = /["”]\s*$/.test(sentence);
    const shouldBreak =
      (bucket.length >= 2 && chars >= 260) ||
      (bucket.length >= 3 && chars >= 180) ||
      chars >= 400 ||
      (endsWithQuote && chars >= 100);

    if (shouldBreak) flush();
  }

  flush();
  return paragraphs;
}

function cleanScrapedText(text: string): string {
  let normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  normalized = stripJunkPrefix(normalized);
  normalized = insertMissingSpaces(normalized);
  normalized = normalized.replace(/\s+/g, " ").trim();
  normalized = stripLeadingByline(normalized);
  normalized = restoreSentenceBoundaries(normalized);
  normalized = stripTrailingBoilerplate(normalized);
  return normalized.trim();
}

/**
 * Turn raw scraped article text into readable paragraphs.
 */
export function formatArticleBody(text: string): string[] {
  if (!text?.trim()) return [];

  if (/\n{2,}/.test(text)) {
    return text
      .split(/\n{2,}/)
      .map((p) => cleanScrapedText(p))
      .filter(Boolean);
  }

  const normalized = cleanScrapedText(text);
  if (!normalized) return [];

  const sentences = splitSentences(normalized);
  if (sentences.length <= 1) return [normalized];

  return groupIntoParagraphs(sentences);
}

export function estimateReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const METHOD_LINE = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+\S+/i;

function scanTitleLine(
  source: string,
  visit: (line: string, index: number) => string | null | void,
): string | null {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let inFence = false;
  let inHttp = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    if (/^(```|~~~)/.test(line)) {
      const lang = line.replace(/^(```|~~~)/, "").trim().toLowerCase().split(/\s+/)[0] ?? "";
      if (!inFence) {
        inFence = true;
        inHttp = lang === "http" || lang === "rest";
      } else {
        inFence = false;
        inHttp = false;
      }
      continue;
    }
    if (inFence) continue;

    if (METHOD_LINE.test(line.trim())) {
      inHttp = true;
      continue;
    }

    if (inHttp) {
      const t = line.trim();
      if (
        t === "" ||
        t.startsWith("#") ||
        t.startsWith("//") ||
        /^[A-Za-z0-9!#$%&'*+.^_`|~-]+:/.test(t) ||
        t.startsWith("{") ||
        t.startsWith("[") ||
        t.startsWith("<")
      ) {
        continue;
      }
      inHttp = false;
    }

    const hit = visit(line, i);
    if (typeof hit === "string") return hit;
  }
  return null;
}

export function extractMarkdownTitle(source: string): string | null {
  return scanTitleLine(source, (line) => {
    const match = line.match(/^#\s+(.+?)\s*$/);
    if (!match) return;
    const title = (match[1] ?? "").trim();
    if (!title || title.startsWith("@extract")) return;
    return title;
  });
}

export function replaceMarkdownTitle(source: string, title: string): string {
  const clean = title.replace(/\s+/g, " ").trim();
  if (!clean) return source;
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let replaced = false;
  scanTitleLine(source, (line, index) => {
    if (replaced) return;
    if (!/^#\s+/.test(line) || /^#\s+@extract/i.test(line)) return;
    lines[index] = `# ${clean}`;
    replaced = true;
    return clean;
  });
  if (replaced) return lines.join("\n");
  // Keep item metadata and Markdown in sync for legacy notes without an H1.
  return `# ${clean}\n\n${source.replace(/^\n+/, "")}`;
}

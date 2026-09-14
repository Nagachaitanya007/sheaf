/** Pure host/IP checks used by the CORS proxy. No DNS here — the server layer resolves. */

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "metadata.google.internal",
  "metadata.goog",
  "metadata.google.internal.",
]);

export function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
}

export function isBlockedHostname(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (!host) return true;
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "169.254.169.254" || host === "metadata") return true;
  return isPrivateIp(host);
}

export function isPrivateIp(address: string): boolean {
  const v4 = parseIPv4(address);
  if (v4) return isPrivateV4(v4);
  const v6 = parseIPv6(address);
  if (v6) return isPrivateV6(v6);
  return false;
}

function parseIPv4(raw: string): number[] | null {
  const host = raw.trim();
  if (/^\d+$/.test(host)) {
    const n = Number(host);
    if (!Number.isSafeInteger(n) || n < 0 || n > 0xffffffff) return null;
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  }
  const parts = host.split(".");
  if (parts.length === 0 || parts.length > 4) return null;
  const nums: number[] = [];
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const n = Number(p);
    if (n > 255) return null;
    nums.push(n);
  }
  while (nums.length < 4) nums.push(0);
  return nums;
}

function isPrivateV4(octets: number[]): boolean {
  const [a, b] = octets;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a === 255) return true;
  return false;
}

function parseIPv6(raw: string): number[] | null {
  let host = raw.trim().toLowerCase();
  if (host.startsWith("::ffff:")) {
    const mapped = parseIPv4(host.slice(7));
    return mapped ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xff, 0xff, ...mapped] : null;
  }
  if (!host.includes(":")) return null;
  const halves = host.split("::");
  if (halves.length > 2) return null;
  const parseHalf = (s: string) =>
    s
      .split(":")
      .filter(Boolean)
      .map((h) => {
        if (!/^[0-9a-f]{1,4}$/.test(h)) return null;
        return Number.parseInt(h, 16);
      });
  if (halves.length === 1) {
    const parts = parseHalf(halves[0]!);
    if (parts.some((p) => p == null) || parts.length !== 8) return null;
    return parts as number[];
  }
  const left = parseHalf(halves[0] ?? "");
  const right = parseHalf(halves[1] ?? "");
  if (left.some((p) => p == null) || right.some((p) => p == null)) return null;
  const fill = 8 - left.length - right.length;
  if (fill < 0) return null;
  return [...(left as number[]), ...Array(fill).fill(0), ...(right as number[])];
}

function isPrivateV6(parts: number[]): boolean {
  if (parts.length === 16) {
    return isPrivateV4(parts.slice(12));
  }
  if (parts.length !== 8) return false;
  if (parts.every((p) => p === 0)) return true; // ::
  if (parts[0] === 0 && parts[1] === 0 && parts[2] === 0 && parts[3] === 0 && parts[4] === 0 && parts[5] === 0 && parts[6] === 0 && parts[7] === 1) {
    return true; // ::1
  }
  const first = parts[0]!;
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7
  if (first === 0x2001 && parts[1] === 0xdb8) return true;
  if (parts[0] === 0 && parts[1] === 0 && parts[2] === 0 && parts[3] === 0 && parts[4] === 0 && parts[5] === 0xffff) {
    return isPrivateV4([(parts[6]! >> 8) & 255, parts[6]! & 255, (parts[7]! >> 8) & 255, parts[7]! & 255]);
  }
  return false;
}

export function blockedReason(hostname: string, ip?: string): string {
  const target = ip ? `${hostname} (${ip})` : hostname;
  return `Blocked destination ${target}. The proxy refuses loopback, private, link-local, and cloud-metadata addresses.`;
}

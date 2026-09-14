import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useScratchpad } from "@/lib/scratchpad/store";
import type { UtilityId } from "@/lib/scratchpad/types";
import {
  SAMPLE,
  UTILITIES,
  base64ToBytes,
  bytesToBase64,
  csvToJson,
  decodeHtml,
  digest,
  encodeHtml,
  epochToParts,
  inspectJwt,
  inspectUnicode,
  jsonDiff,
  jsonToCsv,
  minifyJson,
  parseUrlParts,
  prettyJson,
  testRegex,
  validateJson,
} from "@/lib/scratchpad/utilities";
import { copyText } from "@/lib/utils";
import { JsonTree } from "./JsonTree";

export function UtilityPanel() {
  const active = useScratchpad((s) => s.activeUtility) ?? "json-format";
  const setUtility = useScratchpad((s) => s.setUtility);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border px-2 py-2">
        <select
          value={active}
          onChange={(e) => setUtility(e.target.value as UtilityId)}
          className="h-8 w-full rounded-md border border-border bg-inset px-2 text-sm text-foreground"
        >
          {UTILITIES.map((u) => (
            <option key={u.id} value={u.id}>
              {u.group} · {u.name}
            </option>
          ))}
        </select>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <UtilityBody id={active} />
      </div>
    </div>
  );
}

function CopyOut({ value }: { value: string }) {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={async () => {
        const ok = await copyText(value);
        toast[ok ? "success" : "error"](ok ? "Copied" : "Copy failed");
      }}
    >
      Copy
    </Button>
  );
}

function IoBox({
  label,
  value,
  onChange,
  result,
  onRun,
  runLabel = "Run",
  rows = 8,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  result?: string;
  onRun?: () => void;
  runLabel?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label ? <p className="text-xs font-medium text-muted">{label}</p> : null}
      <Textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      {onRun ? (
        <div className="flex gap-2">
          <Button size="sm" variant="send" onClick={onRun}>
            {runLabel}
          </Button>
          {result ? <CopyOut value={result} /> : null}
        </div>
      ) : null}
      {result != null ? (
        <pre className="max-h-72 overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs leading-relaxed text-foreground">
          {result || "—"}
        </pre>
      ) : null}
    </div>
  );
}

function UtilityBody({ id }: { id: UtilityId }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [out, setOut] = useState("");
  const [flags, setFlags] = useState("g");
  const [hashAlgo, setHashAlgo] = useState<"SHA-1" | "SHA-256" | "SHA-512">("SHA-256");
  const [uuids, setUuids] = useState<string[]>([]);

  if (id === "json-format") {
    return (
      <IoBox
        label="JSON"
        value={a}
        onChange={setA}
        result={out}
        onRun={() => {
          const r = prettyJson(a);
          setOut(r.ok ? r.value : r.error);
        }}
        runLabel="Format"
      />
    );
  }
  if (id === "json-minify") {
    return (
      <IoBox
        value={a}
        onChange={setA}
        result={out}
        onRun={() => {
          const r = minifyJson(a);
          setOut(r.ok ? r.value : r.error);
        }}
        runLabel="Minify"
      />
    );
  }
  if (id === "json-validate") {
    const r = a.trim() ? validateJson(a) : null;
    return (
      <div className="flex flex-col gap-2">
        <Textarea rows={10} value={a} onChange={(e) => setA(e.target.value)} placeholder="{ }" />
        {r ? (
          <p className={r.ok ? "text-sm text-success" : "text-sm text-danger"}>{r.ok ? "Valid JSON" : r.error}</p>
        ) : (
          <p className="text-xs text-muted">Paste JSON to validate.</p>
        )}
      </div>
    );
  }
  if (id === "json-tree") {
    return (
      <div className="flex flex-col gap-2">
        <Textarea rows={6} value={a} onChange={(e) => setA(e.target.value)} placeholder="{ }" />
        <div className="rounded-md border border-border">
          <JsonTree raw={a} />
        </div>
      </div>
    );
  }
  if (id === "json-diff") {
    const diff = a.trim() && b.trim() ? jsonDiff(a, b) : null;
    return (
      <div className="flex flex-col gap-2">
        <Textarea rows={5} value={a} onChange={(e) => setA(e.target.value)} placeholder="Left JSON" />
        <Textarea rows={5} value={b} onChange={(e) => setB(e.target.value)} placeholder="Right JSON" />
        {diff && !diff.ok ? <p className="text-xs text-danger">{diff.error}</p> : null}
        {diff && diff.ok ? (
          <pre className="max-h-80 overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs">
            {diff.lines.map((l, i) => (
              <div
                key={i}
                className={
                  l.type === "add" ? "bg-success/15 text-success" : l.type === "del" ? "bg-danger/15 text-danger" : "text-muted"
                }
              >
                {l.type === "add" ? "+" : l.type === "del" ? "−" : " "} {l.text}
              </div>
            ))}
          </pre>
        ) : null}
      </div>
    );
  }
  if (id === "json-csv") {
    return (
      <IoBox
        value={a}
        onChange={setA}
        result={out}
        onRun={() => {
          const r = jsonToCsv(a);
          setOut(r.ok ? r.value : r.error);
        }}
        runLabel="To CSV"
      />
    );
  }
  if (id === "csv-json") {
    return (
      <IoBox
        value={a}
        onChange={setA}
        result={out}
        onRun={() => {
          const r = csvToJson(a);
          setOut(r.ok ? r.value : r.error);
        }}
        runLabel="To JSON"
      />
    );
  }
  if (id === "base64-encode") {
    return (
      <IoBox
        value={a}
        onChange={setA}
        result={out}
        onRun={() => {
          try {
            setOut(bytesToBase64(a));
          } catch (e) {
            setOut(e instanceof Error ? e.message : String(e));
          }
        }}
      />
    );
  }
  if (id === "base64-decode") {
    return (
      <IoBox
        value={a}
        onChange={setA}
        result={out}
        onRun={() => {
          try {
            setOut(base64ToBytes(a));
          } catch (e) {
            setOut(e instanceof Error ? e.message : String(e));
          }
        }}
      />
    );
  }
  if (id === "url-encode") {
    return <IoBox value={a} onChange={setA} result={out} onRun={() => setOut(encodeURIComponent(a))} />;
  }
  if (id === "url-decode") {
    return (
      <IoBox
        value={a}
        onChange={setA}
        result={out}
        onRun={() => {
          try {
            setOut(decodeURIComponent(a));
          } catch (e) {
            setOut(e instanceof Error ? e.message : String(e));
          }
        }}
      />
    );
  }
  if (id === "html-entities") {
    return (
      <div className="flex flex-col gap-2">
        <Textarea rows={6} value={a} onChange={(e) => setA(e.target.value)} />
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setOut(encodeHtml(a))}>
            Encode
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setOut(decodeHtml(a))}>
            Decode
          </Button>
          {out ? <CopyOut value={out} /> : null}
        </div>
        <pre className="max-h-56 overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs">{out}</pre>
      </div>
    );
  }
  if (id === "jwt") {
    const info = a.trim() ? inspectJwt(a) : null;
    return (
      <div className="flex flex-col gap-2">
        <Textarea rows={4} value={a} onChange={(e) => setA(e.target.value)} placeholder="eyJhbGciOi..." />
        {info && !info.ok ? <p className="text-xs text-danger">{info.error}</p> : null}
        {info?.ok ? (
          <>
            <p className="text-xs text-muted">Header</p>
            <pre className="overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs">
              {JSON.stringify(info.header, null, 2)}
            </pre>
            <p className="text-xs text-muted">Payload</p>
            <pre className="overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs">
              {JSON.stringify(info.payload, null, 2)}
            </pre>
            <p className="text-2xs text-subtle">Signature is not verified. Secret keys never leave this browser.</p>
          </>
        ) : null}
      </div>
    );
  }
  if (id === "url-parse") {
    const parsed = a.trim() ? parseUrlParts(a) : null;
    return (
      <div className="flex flex-col gap-2">
        <Input value={a} onChange={(e) => setA(e.target.value)} placeholder="https://api.example.com/v1?x=1" />
        {parsed && "error" in parsed ? <p className="text-xs text-danger">{parsed.error}</p> : null}
        {parsed && !("error" in parsed) ? (
          <dl className="space-y-1 font-mono text-xs">
            {Object.entries(parsed).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[88px_1fr] gap-2">
                <dt className="text-subtle">{k}</dt>
                <dd className="break-all text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    );
  }
  if (id === "unicode") {
    const rows = inspectUnicode(a).slice(0, 200);
    return (
      <div className="flex flex-col gap-2">
        <Input value={a} onChange={(e) => setA(e.target.value)} placeholder="Paste characters" />
        <table className="w-full text-left text-xs">
          <thead className="text-muted">
            <tr>
              <th className="py-1">Char</th>
              <th>Hex</th>
              <th>Dec</th>
              <th>UTF-8</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-1">{r.char}</td>
                <td>{r.hex}</td>
                <td>{r.dec}</td>
                <td>{r.utf8}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (id === "regex") {
    const result = a ? testRegex(a, flags, b) : null;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Input value={a} onChange={(e) => setA(e.target.value)} placeholder="pattern" className="font-mono" />
          <Input value={flags} onChange={(e) => setFlags(e.target.value)} className="w-20 font-mono" />
        </div>
        <Textarea rows={6} value={b} onChange={(e) => setB(e.target.value)} placeholder="test string" />
        {result && !result.ok ? <p className="text-xs text-danger">{result.error}</p> : null}
        {result && result.ok ? (
          <div className="text-xs">
            <p className="mb-1 text-muted">{result.matches.length} match{result.matches.length === 1 ? "" : "es"}</p>
            <ul className="space-y-1 font-mono">
              {result.matches.map((m, i) => (
                <li key={i} className="rounded-sm bg-elevated px-2 py-1">
                  @{m.index} {JSON.stringify(m.text)}
                  {m.groups.length ? ` groups=${JSON.stringify(m.groups)}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }
  if (id === "epoch") {
    const parts = epochToParts(a);
    return (
      <div className="flex flex-col gap-2">
        <Input value={a} onChange={(e) => setA(e.target.value)} placeholder="1710000000 or ISO date" />
        {"error" in parts ? (
          <p className="text-xs text-danger">{parts.error}</p>
        ) : (
          <dl className="space-y-1 font-mono text-xs">
            <div>unix {parts.unix}</div>
            <div>ms {parts.unixMs}</div>
            <div>{parts.iso}</div>
            <div className="text-muted">{parts.date}</div>
          </dl>
        )}
        <Button size="sm" variant="secondary" onClick={() => setA(String(Math.floor(Date.now() / 1000)))}>
          Now
        </Button>
      </div>
    );
  }
  if (id === "hash") {
    return (
      <div className="flex flex-col gap-2">
        <Textarea rows={5} value={a} onChange={(e) => setA(e.target.value)} />
        <div className="flex gap-2">
          <select
            value={hashAlgo}
            onChange={(e) => setHashAlgo(e.target.value as typeof hashAlgo)}
            className="h-8 rounded-md border border-border bg-inset px-2 text-xs"
          >
            <option>SHA-1</option>
            <option>SHA-256</option>
            <option>SHA-512</option>
          </select>
          <Button
            size="sm"
            variant="send"
            onClick={async () => {
              setOut(await digest(hashAlgo, a));
            }}
          >
            Hash
          </Button>
        </div>
        <pre className="break-all rounded-md border border-border bg-inset p-2 font-mono text-xs">{out}</pre>
      </div>
    );
  }
  if (id === "uuid") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          size="sm"
          variant="send"
          onClick={() => {
            const next = crypto.randomUUID();
            setOut(next);
            setUuids((prev) => [next, ...prev].slice(0, 8));
          }}
        >
          Generate
        </Button>
        <pre className="rounded-md border border-border bg-inset p-2 font-mono text-xs">{out || "Click generate"}</pre>
        <ul className="space-y-1 font-mono text-xs text-muted">
          {uuids.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
    );
  }
  if (id === "lorem") {
    return (
      <div className="flex flex-col gap-2">
        <Button size="sm" variant="secondary" onClick={() => setOut(SAMPLE.lorem)}>
          Paragraph
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOut(SAMPLE.json)}>
          JSON
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOut(SAMPLE.http)}>
          HTTP
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setOut(SAMPLE.csv)}>
          CSV
        </Button>
        {out ? (
          <>
            <CopyOut value={out} />
            <pre className="overflow-auto rounded-md border border-border bg-inset p-2 font-mono text-xs">{out}</pre>
          </>
        ) : null}
      </div>
    );
  }
  return null;
}

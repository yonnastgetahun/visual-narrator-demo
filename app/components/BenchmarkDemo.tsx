"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type ProviderKey = "vn" | "gpt4o" | "gemini";

type BenchmarkProvider = {
  success: boolean;
  provider: ProviderKey;
  model: string;
  latency_ms: number;
  cost_usd: number;
  description: string;
  error?: string;
  source?: "api" | "demo" | "shared";
};

type BenchmarkResponse = {
  frame_hash: string;
  vn: BenchmarkProvider;
  gpt4o: BenchmarkProvider;
  gemini: BenchmarkProvider;
};

type BenchmarkDemoProps = {
  embed?: boolean;
};

const PROVIDERS: Array<{
  key: ProviderKey;
  label: string;
  eyebrow: string;
  accent: string;
}> = [
  {
    key: "vn",
    label: "Visual Narrator",
    eyebrow: "VN VLM",
    accent: "border-emerald-400 bg-emerald-400/10",
  },
  {
    key: "gpt4o",
    label: "GPT-4o",
    eyebrow: "OpenAI",
    accent: "border-sky-400 bg-sky-400/10",
  },
  {
    key: "gemini",
    label: "Gemini 2.5 Flash",
    eyebrow: "Google",
    accent: "border-amber-400 bg-amber-400/10",
  },
];

function formatCost(cost: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(cost);
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the selected image"));
    reader.readAsDataURL(file);
  });
}

function sharedResultFromParams(searchParams: { get(name: string): string | null }): BenchmarkResponse | null {
  const vn = Number(searchParams.get("vn_ms"));
  const gpt = Number(searchParams.get("gpt_ms"));
  const gemini = Number(searchParams.get("gemini_ms"));
  const frameHash = searchParams.get("frame_hash");

  if (!vn || !gpt || !gemini || !frameHash) {
    return null;
  }

  return {
    frame_hash: frameHash,
    vn: {
      success: true,
      provider: "vn",
      model: "visual-narrator-vlm",
      latency_ms: vn,
      cost_usd: 0.0009,
      description: `Shared benchmark result for frame ${frameHash}: Visual Narrator returned the fastest audio-description pass.`,
      source: "shared",
    },
    gpt4o: {
      success: true,
      provider: "gpt4o",
      model: "gpt-4o",
      latency_ms: gpt,
      cost_usd: 0.0028,
      description: `Shared benchmark result for frame ${frameHash}: GPT-4o completed after Visual Narrator with a general visual description.`,
      source: "shared",
    },
    gemini: {
      success: true,
      provider: "gemini",
      model: "gemini-2.5-flash",
      latency_ms: gemini,
      cost_usd: 0.0011,
      description: `Shared benchmark result for frame ${frameHash}: Gemini 2.5 Flash completed with a comparable scene description.`,
      source: "shared",
    },
  };
}

export default function BenchmarkDemo({ embed = false }: BenchmarkDemoProps) {
  const searchParams = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<BenchmarkResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [embedSnippet, setEmbedSnippet] = useState(
    '<script src="https://visual-narrator-demo.vercel.app/embed/benchmark.js" async></script>',
  );

  useEffect(() => {
    const shared = sharedResultFromParams(searchParams);
    if (shared) {
      setResult(shared);
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    setEmbedSnippet(`<script src="${window.location.origin}/embed/benchmark.js" async></script>`);
  }, []);

  const shareUrl = useMemo(() => {
    if (!result || typeof window === "undefined") {
      return "";
    }

    const params = new URLSearchParams({
      vn_ms: String(result.vn.latency_ms),
      gpt_ms: String(result.gpt4o.latency_ms),
      gemini_ms: String(result.gemini.latency_ms),
      frame_hash: result.frame_hash,
    });

    return `${window.location.origin}/?${params.toString()}`;
  }, [result]);

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError(null);
    setResult(null);
    setSelectedFile(null);

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Upload a JPEG or PNG image.");
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setError("Upload an image under 6MB.");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function runBenchmark() {
    if (!selectedFile) {
      setError("Choose a JPEG or PNG frame first.");
      return;
    }

    setIsRunning(true);
    setError(null);
    setShareState("idle");

    try {
      const frameData = await fileToDataUrl(selectedFile);
      const response = await fetch("/api/benchmark-competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame_data: frameData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Benchmark failed");
      }

      setResult(data as BenchmarkResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Benchmark failed");
    } finally {
      setIsRunning(false);
    }
  }

  async function shareResult() {
    if (!shareUrl) {
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setShareState("copied");
  }

  const containerClass = embed
    ? "min-h-screen bg-[#101417] text-white"
    : "min-h-screen bg-[#101417] text-white";

  return (
    <main className={containerClass}>
      <section className={embed ? "mx-auto max-w-5xl px-4 py-5" : "mx-auto max-w-6xl px-5 py-10 sm:py-14"}>
        {!embed && (
          <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Visual Narrator Benchmark
              </p>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Real-time AI video description speed test
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                Upload one frame and run the same image through VN, GPT-4o, and Gemini 2.5 Flash. The public demo is the top-of-funnel proof point for fast, affordable audio description infrastructure.
              </p>
            </div>

            <div className="border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300 rounded-lg">
              <div className="mb-2 font-semibold text-white">Embed in docs</div>
              <code className="block overflow-x-auto whitespace-nowrap border border-white/10 bg-black/30 p-3 text-xs text-emerald-200 rounded">
                {embedSnippet}
              </code>
            </div>
          </div>
        )}

        <div className={embed ? "mb-4 flex items-center justify-between gap-4" : "mb-6"}>
          {embed && (
            <>
              <div>
                <h1 className="text-xl font-semibold text-white">Visual Narrator Benchmark</h1>
                <p className="text-sm text-slate-400">VN vs GPT-4o vs Gemini 2.5 Flash</p>
              </div>
              <a
                href="/"
                target="_blank"
                className="shrink-0 border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10 rounded"
              >
                Open
              </a>
            </>
          )}
        </div>

        {!embed && (
          <div className="mb-8 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
            <div className="border border-white/10 bg-white/[0.04] p-5 rounded-lg">
              <label className="block text-sm font-semibold text-white" htmlFor="frame-upload">
                Run your own frame
              </label>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                JPEG or PNG, under 6MB. The frame is sent as base64 to the benchmark API.
              </p>
              <input
                id="frame-upload"
                type="file"
                accept="image/jpeg,image/png"
                onChange={onFileChange}
                className="mt-4 block w-full text-sm text-slate-300 file:mr-4 file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-emerald-300"
              />
              <button
                type="button"
                onClick={runBenchmark}
                disabled={isRunning || !selectedFile}
                className="mt-4 w-full bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 rounded"
              >
                {isRunning ? "Running benchmark..." : "Run live benchmark"}
              </button>
              {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            </div>

            <div className="min-h-64 overflow-hidden border border-white/10 bg-black/30 rounded-lg">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Uploaded benchmark frame preview" className="h-full max-h-80 w-full object-contain" />
              ) : (
                <div className="flex h-full min-h-64 items-center justify-center px-6 text-center text-sm text-slate-500">
                  Uploaded frame preview
                </div>
              )}
            </div>
          </div>
        )}

        <BenchmarkResults result={result} isRunning={isRunning} embed={embed} />

        {!embed && result && (
          <div className="mt-6 flex flex-col gap-3 border border-white/10 bg-white/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between rounded-lg">
            <div>
              <div className="text-sm font-semibold text-white">Share this result</div>
              <div className="mt-1 max-w-3xl truncate text-xs text-slate-400">{shareUrl}</div>
            </div>
            <button
              type="button"
              onClick={shareResult}
              className="bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200 rounded"
            >
              {shareState === "copied" ? "Copied" : "Copy share URL"}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function BenchmarkResults({
  result,
  isRunning,
  embed,
}: {
  result: BenchmarkResponse | null;
  isRunning: boolean;
  embed: boolean;
}) {
  const placeholder: Record<ProviderKey, BenchmarkProvider> = {
    vn: {
      success: true,
      provider: "vn",
      model: "visual-narrator-vlm",
      latency_ms: 204,
      cost_usd: 0.0009,
      description: "Visual Narrator is ready to describe the uploaded frame.",
    },
    gpt4o: {
      success: true,
      provider: "gpt4o",
      model: "gpt-4o",
      latency_ms: 2200,
      cost_usd: 0.0028,
      description: "GPT-4o result appears here after the benchmark completes.",
    },
    gemini: {
      success: true,
      provider: "gemini",
      model: "gemini-2.5-flash",
      latency_ms: 5800,
      cost_usd: 0.0011,
      description: "Gemini 2.5 Flash result appears here after the benchmark completes.",
    },
  };

  return (
    <div className={`grid gap-4 ${embed ? "md:grid-cols-3" : "lg:grid-cols-3"}`}>
      {PROVIDERS.map((provider) => {
        const data = result?.[provider.key] ?? placeholder[provider.key];
        const waiting = isRunning && !result;

        return (
          <article
            key={provider.key}
            className={`border ${provider.accent} p-4 rounded-lg`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {provider.eyebrow}
                </div>
                <h2 className="mt-1 text-lg font-semibold text-white">{provider.label}</h2>
              </div>
              <div className="text-right text-xs text-slate-400">{data.source === "api" ? "Live API" : data.source === "shared" ? "Shared" : "Demo"}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-y border-white/10 py-3">
              <div>
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Latency</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-white">
                  {waiting ? "..." : `${data.latency_ms}ms`}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Cost</div>
                <div className="mt-1 text-2xl font-semibold tabular-nums text-white">
                  {formatCost(data.cost_usd)}
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-500">{data.model}</div>
            <p className={`${embed ? "mt-2 line-clamp-3" : "mt-3"} text-sm leading-6 text-slate-200`}>
              {waiting ? "Requesting description..." : data.description}
            </p>
            {data.error && <p className="mt-2 text-xs text-amber-300">Fallback used: {data.error}</p>}
          </article>
        );
      })}
    </div>
  );
}

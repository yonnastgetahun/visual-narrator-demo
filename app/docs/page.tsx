import { Check, Code2, KeyRound, ReceiptText, Timer } from "lucide-react";

const curlExample = `curl -X POST https://visual-narrator-demo.vercel.app/api/v1/describe-frame \\
  -H "Content-Type: application/json" \\
  -d '{
    "api_key": "vn_live_...",
    "frame_base64": "'"$BASE64_TEST_FRAME"'"
  }'`;

const pythonExample = `import base64
import requests

with open("frame.jpg", "rb") as image:
    frame_base64 = base64.b64encode(image.read()).decode("utf-8")

response = requests.post(
    "https://visual-narrator-demo.vercel.app/api/v1/describe-frame",
    json={
        "api_key": "vn_live_...",
        "frame_base64": frame_base64,
    },
    timeout=20,
)
response.raise_for_status()
print(response.json()["description"])`;

const responseExample = `{
  "description": "A cyclist crosses a wet city street while headlights reflect across the pavement.",
  "objects_detected": 6,
  "latency_ms": 214,
  "cost_estimate": 0.001,
  "model_version": "visual-narrator-blip2-rekognition-v1"
}`;

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#171717]">
      <section className="border-b border-[#d8d2c7] bg-[#1f2933] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#8fd6c2]">
              Visual Narrator API
            </p>
            <h1 className="text-4xl font-semibold md:text-6xl">Frame Description API</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d7dee6]">
              Send a base64 image frame and receive a BLIP-2 narrative description, Rekognition object count,
              latency, cost estimate, and model version.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border border-white/15 bg-white/8 p-4">
              <Timer className="mb-3 h-5 w-5 text-[#8fd6c2]" />
              <div className="font-semibold">~200ms warm</div>
              <div className="text-[#c6d0da]">Lambda inference</div>
            </div>
            <div className="border border-white/15 bg-white/8 p-4">
              <ReceiptText className="mb-3 h-5 w-5 text-[#8fd6c2]" />
              <div className="font-semibold">$0.001/frame</div>
              <div className="text-[#c6d0da]">Metered paid tier</div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit border border-[#d8d2c7] bg-white p-5 text-sm">
          <nav className="grid gap-3">
            <a href="#endpoint" className="font-medium text-[#1f2933]">
              Endpoint
            </a>
            <a href="#auth" className="font-medium text-[#1f2933]">
              API Keys
            </a>
            <a href="#examples" className="font-medium text-[#1f2933]">
              Examples
            </a>
            <a href="#pricing" className="font-medium text-[#1f2933]">
              Pricing
            </a>
            <a href="#errors" className="font-medium text-[#1f2933]">
              Errors
            </a>
          </nav>
        </aside>

        <div className="grid gap-8">
          <section id="endpoint" className="border border-[#d8d2c7] bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <Code2 className="h-5 w-5 text-[#247f6a]" />
              <h2 className="text-2xl font-semibold">Endpoint Spec</h2>
            </div>
            <div className="overflow-x-auto bg-[#101417] p-4 text-sm text-[#e8edf2]">
              <code>POST https://visual-narrator-demo.vercel.app/api/v1/describe-frame</code>
            </div>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="font-semibold">Request</dt>
                <dd className="mt-1 text-[#4b5563]">{"{ frame_base64: string, api_key: string }"}</dd>
              </div>
              <div>
                <dt className="font-semibold">Response</dt>
                <dd className="mt-1 text-[#4b5563]">
                  {"{ description, objects_detected, latency_ms, cost_estimate, model_version }"}
                </dd>
              </div>
            </dl>
            <pre className="mt-5 overflow-x-auto bg-[#101417] p-4 text-sm leading-6 text-[#e8edf2]">
              <code>{responseExample}</code>
            </pre>
          </section>

          <section id="auth" className="border border-[#d8d2c7] bg-white p-6">
            <div className="mb-5 flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-[#247f6a]" />
              <h2 className="text-2xl font-semibold">API Keys</h2>
            </div>
            <p className="text-[#4b5563]">
              Create a free API key with an email address. Free keys are limited to 100 frames per UTC day.
            </p>
            <pre className="mt-5 overflow-x-auto bg-[#101417] p-4 text-sm leading-6 text-[#e8edf2]">
              <code>{`curl -X POST https://visual-narrator-demo.vercel.app/api/keys/create \\
  -H "Content-Type: application/json" \\
  -d '{"email":"dev@example.com"}'`}</code>
            </pre>
          </section>

          <section id="examples" className="grid gap-6">
            <div className="border border-[#d8d2c7] bg-white p-6">
              <h2 className="text-2xl font-semibold">Curl Example</h2>
              <pre className="mt-5 overflow-x-auto bg-[#101417] p-4 text-sm leading-6 text-[#e8edf2]">
                <code>{curlExample}</code>
              </pre>
            </div>
            <div className="border border-[#d8d2c7] bg-white p-6">
              <h2 className="text-2xl font-semibold">Python Example</h2>
              <pre className="mt-5 overflow-x-auto bg-[#101417] p-4 text-sm leading-6 text-[#e8edf2]">
                <code>{pythonExample}</code>
              </pre>
            </div>
          </section>

          <section id="pricing" className="border border-[#d8d2c7] bg-white p-6">
            <h2 className="text-2xl font-semibold">Pricing</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ["Free", "100 frames/day", "$0", "For evaluation and prototypes"],
                ["Paid", "Unlimited frames", "$0.001/frame", "Stripe metered usage"],
              ].map(([name, quota, price, detail]) => (
                <div key={name} className="border border-[#d8d2c7] p-5">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-[#247f6a]" />
                    <h3 className="text-xl font-semibold">{name}</h3>
                  </div>
                  <p className="mt-4 text-3xl font-semibold">{price}</p>
                  <p className="mt-2 font-medium">{quota}</p>
                  <p className="mt-2 text-[#4b5563]">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="errors" className="border border-[#d8d2c7] bg-white p-6">
            <h2 className="text-2xl font-semibold">Errors</h2>
            <p className="mt-3 text-[#4b5563]">
              Error responses use a stable JSON shape with a machine-readable code and documentation URL.
            </p>
            <pre className="mt-5 overflow-x-auto bg-[#101417] p-4 text-sm leading-6 text-[#e8edf2]">
              <code>{`{
  "error": "Invalid API key",
  "code": "unauthorized",
  "docs_url": "/docs"
}`}</code>
            </pre>
          </section>
        </div>
      </div>
    </main>
  );
}

import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const script = `
(function () {
  var currentScript = document.currentScript;
  var iframe = document.createElement('iframe');
  iframe.src = '${origin}/embed/benchmark';
  iframe.title = 'Visual Narrator Benchmark';
  iframe.loading = 'lazy';
  iframe.style.width = '100%';
  iframe.style.maxWidth = '960px';
  iframe.style.height = '580px';
  iframe.style.border = '0';
  iframe.style.display = 'block';
  iframe.style.background = '#101417';
  if (currentScript && currentScript.parentNode) {
    currentScript.parentNode.insertBefore(iframe, currentScript);
  }
})();
`.trim();

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

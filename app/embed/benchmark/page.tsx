import { Suspense } from "react";
import BenchmarkDemo from "@/app/components/BenchmarkDemo";

export default function BenchmarkEmbedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#101417]" />}>
      <BenchmarkDemo embed />
    </Suspense>
  );
}

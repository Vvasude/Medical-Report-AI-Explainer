import { useCallback, useState } from "react";
import { toast } from "sonner";
import UploadView from "@/components/UploadView";
import LoadingView from "@/components/LoadingView";
import ResultsView from "@/components/ResultsView";
import { analyzePdf, type AnalysisResult } from "@/lib/api";

type View = "upload" | "loading" | "results";

const Index = () => {
  const [view, setView] = useState<View>("upload");
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = useCallback(async (file: File) => {
    setView("loading");
    try {
      const data = await analyzePdf(file);
      setResult(data);
      setView("results");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Analysis failed";
      toast.error(message);
      setResult(null);
      setView("upload");
    }
  }, []);

  if (view === "loading") {
    return <LoadingView />;
  }
  if (view === "results" && result) {
    return (
      <ResultsView
        data={result}
        onReset={() => {
          setResult(null);
          setView("upload");
        }}
      />
    );
  }
  return <UploadView onAnalyze={handleAnalyze} />;
};

export default Index;

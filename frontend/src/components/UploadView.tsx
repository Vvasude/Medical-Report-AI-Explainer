import { useState, useCallback } from "react";
import { Upload, FileText, X, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import sampleReportUrl from "../../assets/Sample_Report.pdf?url";

interface UploadViewProps {
  onAnalyze: (file: File) => void | Promise<void>;
}

const SAMPLE_FILENAME = "Sample_Report.pdf";

const UploadView = ({ onAnalyze }: UploadViewProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);

  const handleUseSample = useCallback(async () => {
    setSampleLoading(true);
    try {
      const res = await fetch(sampleReportUrl);
      if (!res.ok) {
        throw new Error("Could not load the sample report.");
      }
      const blob = await res.blob();
      setFile(
        new File([blob], SAMPLE_FILENAME, {
          type: "application/pdf",
        }),
      );
      toast.success("Sample report loaded — click Analyze when you’re ready.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load the sample report.");
    } finally {
      setSampleLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent mb-4">
            <FileText className="w-7 h-7 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Lab Results Explainer</h1>
          <p className="text-muted-foreground">
            Upload your lab results and get a plain-English explanation
          </p>
        </div>

        <div className="bg-card rounded-xl shadow-sm border p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${
              dragOver ? "border-primary bg-accent" : "border-border hover:border-primary/50"
            }`}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              Drag & drop your file here
            </p>
            <p className="text-xs text-muted-foreground">PDF only (lab report export)</p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4 gap-2"
            onClick={() => void handleUseSample()}
            disabled={sampleLoading}
          >
            <FlaskConical className="w-4 h-4 shrink-0" />
            {sampleLoading ? "Loading sample…" : "Try with our sample lab report (PDF)"}
          </Button>

          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 flex items-center gap-3 bg-secondary rounded-lg px-4 py-3"
            >
              <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
              <button onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          <Button
            onClick={() => file && void onAnalyze(file)}
            disabled={!file}
            size="lg"
            className="w-full mt-5 text-base font-semibold"
          >
            Analyze My Results
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6 max-w-sm mx-auto">
          This tool is for informational purposes only and does not constitute medical advice.
        </p>
      </motion.div>
    </div>
  );
};

export default UploadView;

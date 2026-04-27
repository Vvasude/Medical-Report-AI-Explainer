import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import RangeBar from "@/components/RangeBar";
import type { AnalysisResult, AnalysisResultRow, LabStatus } from "@/lib/api";

const statusColor: Record<LabStatus, string> = {
  Normal: "bg-success/15 text-success",
  Low: "bg-warning/15 text-warning",
  High: "bg-destructive/15 text-destructive",
};

function normalizeStatus(s: string): LabStatus {
  if (s === "Normal" || s === "Low" || s === "High") return s;
  return "Normal";
}

function rowNumeric(r: AnalysisResultRow) {
  return {
    value: Number(r.value),
    low: Number(r.reference_low),
    high: Number(r.reference_high),
  };
}

interface ResultsViewProps {
  data: AnalysisResult;
  onReset: () => void;
}

const ResultsView = ({ data, onReset }: ResultsViewProps) => {
  const flagged =
    typeof data.flagged_count === "number"
      ? data.flagged_count
      : data.results.filter((r) => normalizeStatus(r.status) !== "Normal").length;

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">Your Results</h1>
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
          >
            Upload new results <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-5 border ${
            flagged > 0
              ? "bg-warning/5 border-warning/20"
              : "bg-success/5 border-success/20"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                flagged > 0 ? "bg-warning" : "bg-success"
              }`}
            />
            <span className="font-semibold text-foreground">
              {flagged > 0
                ? `${flagged} value${flagged > 1 ? "s" : ""} flagged`
                : "All values normal"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {data.summary?.trim() ||
              (flagged > 0
                ? "Some of your results are outside the normal range. See details below."
                : "All your lab results fall within the expected reference ranges.")}
          </p>
        </motion.div>

        {(data.results ?? []).map((result, i) => {
          const status = normalizeStatus(result.status);
          const { value, low, high } = rowNumeric(result);
          return (
            <motion.div
              key={`${result.test_name}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-card rounded-xl border shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{result.test_name}</h3>
                  <p className="text-xl font-bold text-foreground mt-0.5">
                    {Number.isFinite(value) ? value : result.value}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      {result.unit}
                    </span>
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[status]}`}
                >
                  {status}
                </span>
              </div>

              {Number.isFinite(value) && Number.isFinite(low) && Number.isFinite(high) ? (
                <RangeBar value={value} low={low} high={high} />
              ) : null}

              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                {result.explanation}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsView;

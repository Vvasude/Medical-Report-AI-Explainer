interface RangeBarProps {
  value: number;
  low: number;
  high: number;
}

const RangeBar = ({ value, low, high }: RangeBarProps) => {
  const range = high - low;
  const pad = range * 0.4;
  const min = low - pad;
  const max = high + pad;
  const total = max - min;

  const normalStart = ((low - min) / total) * 100;
  const normalWidth = (range / total) * 100;
  const markerPos = Math.max(0, Math.min(100, ((value - min) / total) * 100));

  const isLow = value < low;
  const isHigh = value > high;
  const markerColor = isLow || isHigh ? (isLow ? "bg-warning" : "bg-destructive") : "bg-success";

  return (
    <div className="relative">
      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
        <span>Low</span>
        <span>Normal</span>
        <span>High</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="absolute top-0 h-full bg-success/30 rounded-full"
          style={{ left: `${normalStart}%`, width: `${normalWidth}%` }}
        />
      </div>
      <div
        className={`absolute bottom-0 w-3.5 h-3.5 rounded-full border-2 border-card shadow-md ${markerColor}`}
        style={{ left: `${markerPos}%`, transform: "translateX(-50%)" }}
      />
    </div>
  );
};

export default RangeBar;

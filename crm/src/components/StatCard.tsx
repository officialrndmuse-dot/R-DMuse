type Tone = "default" | "green" | "orange" | "blue";

const TONE_CLASSES: Record<Tone, string> = {
  default: "bg-white",
  green: "bg-green-50",
  orange: "bg-orange-50",
  blue: "bg-blue-50",
};

export function StatCard({
  label, value, hint, tone = "default",
}: { label: string; value: string; hint?: string; tone?: Tone }) {
  return (
    <div className={`rounded-xl2 ${TONE_CLASSES[tone]} p-5 shadow-soft`}>
      <p className="text-sm text-plum/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-plum">{value}</p>
      {hint && <p className="mt-1 text-xs text-plum/40">{hint}</p>}
    </div>
  );
}

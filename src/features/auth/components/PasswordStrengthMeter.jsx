const RULES = [
  { key: "length",    label: "At least 8 characters",   test: (p) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter",     test: (p) => /[A-Z]/.test(p) },
  { key: "lowercase", label: "One lowercase letter",     test: (p) => /[a-z]/.test(p) },
  { key: "number",    label: "One number",               test: (p) => /[0-9]/.test(p) },
  { key: "special",   label: "One special character",    test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const LEVELS = [
  { label: "Very weak", barColor: "bg-red-500",   textColor: "text-red-500" },
  { label: "Weak",      barColor: "bg-red-400",   textColor: "text-red-400" },
  { label: "Fair",      barColor: "bg-orange-400",textColor: "text-orange-400" },
  { label: "Good",      barColor: "bg-yellow-400",textColor: "text-yellow-500" },
  { label: "Strong",    barColor: "bg-green-400", textColor: "text-green-500" },
  { label: "Very strong", barColor: "bg-green-500", textColor: "text-green-600" },
];

export function PasswordStrengthMeter({ password }) {
  if (!password) return null;

  const score = RULES.filter((r) => r.test(password)).length;
  const level = LEVELS[score];
  const fillPct = (score / RULES.length) * 100;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${level.barColor}`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        <span className={`text-xs font-medium w-20 text-right ${level.textColor}`}>
          {level.label}
        </span>
      </div>

      {/* Rule checklist */}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        {RULES.map((rule) => {
          const met = rule.test(password);
          return (
            <li
              key={rule.key}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                met ? "text-green-600" : "text-slate-400"
              }`}
            >
              {met ? (
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" />
                </svg>
              )}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { useId, useState, type FormEvent } from "react";
import { Plus, X } from "lucide-react";
import type { InspectionPolicy } from "./savedProblems";

const basicTags = ["print", "len", "range"];
const modes = [
  { value: "deny", title: "금지 목록 방식", description: "지정한 요소를 사용하면 FLAG 처리" },
  { value: "allow", title: "허용 목록 방식", description: "허용한 요소 외의 요소를 사용하면 FLAG 처리" },
] as const;

export function InspectionPolicyEditor({
  policy, onChange, disabled,
}: {
  policy: InspectionPolicy;
  onChange: (policy: InspectionPolicy) => void;
  disabled: boolean;
}) {
  const modeName = useId();
  const tagId = useId();
  const [tag, setTag] = useState("");
  const [required, setRequired] = useState(false);
  const [error, setError] = useState("");
  const listKey = policy.mode === "deny" ? "deniedTags" : "allowedTags";
  const listLabel = policy.mode === "deny" ? "금지" : "허용";
  const entries = [
    ...policy[listKey].map((value) => ({ value, key: listKey, label: listLabel } as const)),
    ...policy.requiredTags.map((value) => ({ value, key: "requiredTags" as const, label: "필수" })),
  ];

  const addTag = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = tag.trim();
    const key = required ? "requiredTags" : listKey;
    if (!/^(import|call|syntax):[^\s:]+$/u.test(value)) {
      setError("import:heapq, call:sorted, syntax:ListComp 형식으로 입력해주세요.");
      return;
    }
    if (policy[key].includes(value)) {
      setError("이미 등록된 태그예요.");
      return;
    }
    if ((key === "deniedTags" && policy.requiredTags.includes(value)) ||
      (key === "requiredTags" && policy.deniedTags.includes(value))) {
      setError("같은 태그를 금지와 필수로 동시에 설정할 수 없어요.");
      return;
    }
    onChange({ ...policy, [key]: [...policy[key], value] });
    setTag("");
    setError("");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <section className="editor-card policy-card min-w-0">
        <h2>검사 방식</h2>
        <div role="group" aria-label="검사 방식" className="grid gap-3">
          {modes.map(({ value, title, description }) => (
            <label
              key={value}
              className={`inspection-option ${policy.mode === value ? "border-blue-600 bg-info-bg" : "border-border"}`}
            >
              <input type="radio" name={modeName} value={value} checked={policy.mode === value} disabled={disabled}
                onChange={() => { onChange({ ...policy, mode: value }); setError(""); }} />
              <span><strong className="block">{title}</strong><small className="text-fg-secondary">{description}</small></span>
            </label>
          ))}
        </div>
        <div className="mt-5 border-0 border-t border-solid border-border pt-4">
          <p className="mt-0 mb-2 text-sm text-fg-secondary">기본 허용 요소</p>
          <div className="flex flex-wrap gap-2">
            {basicTags.map((value) => <code key={value} className="rounded-md bg-success-bg px-2 py-1 font-mono text-sm text-success-fg">{value}</code>)}
          </div>
        </div>
      </section>

      <section className="editor-card policy-card min-w-0">
        <h2>{listLabel}·필수 태그</h2>
        <p className="mt-0 text-sm text-fg-secondary">태그 위반은 FLAG 검토 항목으로 표시됩니다.</p>
        {entries.length > 0 ? (
          <ul className="m-0 list-none p-0">
            {entries.map(({ value, key, label }) => (
              <li key={`${key}-${value}`} className="flex items-center gap-3 border-0 border-b border-solid border-border py-2">
                <code className="min-w-0 flex-1 font-mono text-sm text-purple-fg [overflow-wrap:anywhere]">{value}</code>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${key === "deniedTags" ? "bg-flag-bg text-flag-text" : "bg-info-bg text-info-text"}`}>{label}</span>
                <button type="button" disabled={disabled} aria-label={`${label} 태그 ${value} 삭제`}
                  className="grid size-8 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-fg-secondary hover:bg-danger-bg hover:text-danger-fg"
                  onClick={() => { onChange({ ...policy, [key]: policy[key].filter((item) => item !== value) }); setError(""); }}>
                  <X size={16} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-fg-secondary">등록된 태그가 없어요.</p>}
        <form onSubmit={addTag} className="mt-4">
          <label htmlFor={tagId}>태그</label>
          <div className="flex flex-wrap items-center gap-2">
            <input id={tagId} className="editor-input inspection-tag-input" placeholder="예: call:sorted" value={tag} disabled={disabled}
              onChange={(event) => { setTag(event.target.value); setError(""); }} />
            <select aria-label="태그 유형" className="editor-input inspection-tag-type" value={required ? "required" : "mode"}
              disabled={disabled} onChange={(event) => { setRequired(event.target.value === "required"); setError(""); }}>
              <option value="mode">{listLabel}</option>
              <option value="required">필수</option>
            </select>
            <button type="submit" className="editor-secondary gap-1" disabled={disabled}>
              <Plus size={16} aria-hidden /> 태그 추가
            </button>
          </div>
          {error && <p role="alert" className="mb-0 text-sm text-danger-fg">{error}</p>}
        </form>
      </section>
    </div>
  );
}

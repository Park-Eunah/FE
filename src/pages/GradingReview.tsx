import styles from "./GradingReview.css?inline";
import { ProfessorLayout } from "../components/layout/ProfessorSidebar";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { readEditableProblem, readProfessorAssignments } from "./professorAssignments";
import { Bell, Check, Eye, Flag, Search, ShieldCheck, X } from "lucide-react";

type ReviewItem = { id: number; assignmentKey: string; name: string; studentId: string; problem: string; score: number; flagCount: number; tag: string; line: number; code: string; fullCode: string; exits: number; awaySeconds: number; times: string[]; groupA: number; groupATotal: number; groupB: number; groupBTotal: number };
const reviews: ReviewItem[] = [
  { id: 1, assignmentKey: "sample-2", name: "김민준", studentId: "20240123", problem: "괄호 문자열 검사", score: 80, flagCount: 1, tag: "call:sorted", line: 12, code: "result = sorted(numbers)", fullCode: "def solve(numbers, target):\n    left, right = 0, len(numbers) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if numbers[mid] == target:\n            return mid\n        if numbers[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    result = sorted(numbers)\n    return -1", exits: 2, awaySeconds: 102, times: ["14:32:08 이탈 · 14:32:41 복귀 · 33초", "14:36:12 이탈 · 14:37:21 복귀 · 69초"], groupA: 30, groupATotal: 30, groupB: 50, groupBTotal: 70 },
  { id: 2, assignmentKey: "sample-2", name: "이서현", studentId: "20240156", problem: "괄호 문자열 검사", score: 85, flagCount: 2, tag: "import:re", line: 4, code: "import re", fullCode: "import re\ndef check_parentheses(text):\n    return re.fullmatch(r'[()]+', text) is not None", exits: 0, awaySeconds: 0, times: [], groupA: 30, groupATotal: 30, groupB: 55, groupBTotal: 70 },
  { id: 3, assignmentKey: "sample-4", name: "최지우", studentId: "20240204", problem: "우선순위 큐 구현", score: 90, flagCount: 1, tag: "call:heapify", line: 8, code: "heapq.heapify(queue)", fullCode: "import heapq\ndef build_queue(values):\n    queue = list(values)\n    heapq.heapify(queue)\n    return queue", exits: 1, awaySeconds: 24, times: ["13:08:10 이탈 · 13:08:34 복귀 · 24초"], groupA: 30, groupATotal: 30, groupB: 60, groupBTotal: 70 },
  { id: 4, assignmentKey: "sample-4", name: "정도윤", studentId: "20240098", problem: "우선순위 큐 구현", score: 95, flagCount: 2, tag: "call:sorted", line: 16, code: "return sorted(items)", fullCode: "def sort_items(items):\n    if not items:\n        return []\n    return sorted(items)", exits: 0, awaySeconds: 0, times: [], groupA: 30, groupATotal: 30, groupB: 65, groupBTotal: 70 },
  { id: 5, assignmentKey: "sample-1", name: "박지민", studentId: "20240311", problem: "두 수의 합", score: 72, flagCount: 1, tag: "import:math", line: 2, code: "import math", fullCode: "import math\ndef add_pair(a, b):\n    return a + b", exits: 3, awaySeconds: 218, times: ["10:14:07 이탈 · 10:15:18 복귀 · 71초", "10:16:02 이탈 · 10:17:33 복귀 · 91초", "10:19:00 이탈 · 10:19:56 복귀 · 56초"], groupA: 22, groupATotal: 30, groupB: 50, groupBTotal: 70 },
];

export function GradingReview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const assignmentKey = searchParams.get("assignment");
  const courseId = searchParams.get("course");
  const fromReviewList = searchParams.get("from") === "review";
  const selectedId = Number(searchParams.get("submission"));
  const [assignments] = useState(readProfessorAssignments);
  const assignment = assignments.find((item) => item.editKey === assignmentKey);
  const assignmentListPath = assignment?.classId && courseId === assignment.classId
    ? `/classes?course=${encodeURIComponent(assignment.classId)}`
    : "/problems";

  const [query, setQuery] = useState("");
  useEffect(() => setQuery(""), [assignmentKey]);
  const [adjustments, setAdjustments] = useState<Record<number, number>>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [resolved, setResolved] = useState<Record<number, "held" | "confirmed">>({});
  const [showCode, setShowCode] = useState(false);
  const [toast, setToast] = useState("");
  const pendingReviews = reviews.filter((item) => !resolved[item.id] && (!assignmentKey || (assignment && item.assignmentKey === assignmentKey)));
  const assignmentTitles = new Map(assignments.map((item) => [item.editKey, item.title]));
  const visibleReviews = pendingReviews.filter((item) =>
    `${item.name} ${item.studentId} ${assignmentTitles.get(item.assignmentKey) ?? item.problem}`.toLowerCase().includes(query.toLowerCase()));
  const reviewGroups = new Map<string, ReviewItem[]>();
  for (const item of visibleReviews) {
    const group = reviewGroups.get(item.assignmentKey);
    if (group) group.push(item);
    else reviewGroups.set(item.assignmentKey, [item]);
  }
  const current = assignment ? pendingReviews.find((item) => item.id === selectedId) ?? pendingReviews[0] : undefined;
  const reviewAssignment = assignment;
  const reviewProblem = (() => {
    try {
      return reviewAssignment?.editKey ? readEditableProblem(reviewAssignment.editKey)?.problem : undefined;
    } catch {
      return undefined;
    }
  })();
  const adjustment = current ? adjustments[current.id] ?? 0 : 0;
  const reason = current ? reasons[current.id] ?? "" : "";
  const finalScore = Math.max(0, Math.min(100, (current?.score ?? 0) + adjustment));
  const sidebarPendingCount = reviews.filter((item) => !resolved[item.id]).length + 2;
  const pendingCount = pendingReviews.length;
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2500); };
  const selectSubmission = (item: ReviewItem) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("assignment", item.assignmentKey);
    nextParams.set("submission", String(item.id));
    if (!assignmentKey) nextParams.set("from", "review");
    setSearchParams(nextParams);
  };
  const resolveReview = (action: "held" | "confirmed") => {
    if (!current) return;
    if (action === "confirmed" && adjustment !== 0 && !reason.trim()) { notify("점수를 조정한 경우 조정 사유를 입력해주세요."); return; }
    setResolved((items) => ({ ...items, [current.id]: action }));
    const next = pendingReviews.find((item) => item.id !== current.id);
    const nextParams = new URLSearchParams(searchParams);
    if (next) nextParams.set("submission", String(next.id));
    else nextParams.delete("submission");
    setSearchParams(nextParams, { replace: true });
    notify(action === "confirmed" ? `${current.name} 학생의 점수를 확정했어요.` : `${current.name} 학생 제출을 보류했어요.`);
  };
  const updateAdjustment = (value: string) => {
    if (current) setAdjustments((items) => ({ ...items, [current.id]: Math.max(-100, Math.min(100, Number(value) || 0)) }));
  };

  return <ProfessorLayout onNotify={notify} pendingCount={sidebarPendingCount}>
    <div className="review-main"><header className="review-topbar"><div className="review-search"><Search size={19} /><input placeholder="문제, 학생 또는 제출 ID 검색" aria-label="전체 검색" /></div><button className="review-bell" aria-label="알림" onClick={() => notify("새 알림이 없습니다.")}><Bell size={22} /><i /></button><div className="review-profile"><b>박서연 교수</b><small>컴퓨터공학과</small></div></header>
      <main className="review-content">
        <div className="review-title">
          <p className="review-eyebrow">PROFESSOR · GRADING REVIEW</p>
          <h1>채점 검토</h1>
          {!assignmentKey && <p>FLAG나 수동 조정이 필요한 제출만 선택적으로 검토하세요.</p>}
          {assignmentKey && !assignment && <p>과제를 찾을 수 없어요.</p>}
          {assignmentKey && (
            <Link className="mt-2 inline-block text-sm font-semibold text-blue-700" to={fromReviewList ? "/review" : assignmentListPath}>
              {fromReviewList ? "전체 답안 목록으로 돌아가기" : "과제 목록으로 돌아가기"}
            </Link>
          )}
        </div>
        {reviewAssignment && (
          <section aria-labelledby="review-problem-title" className="mb-4 rounded-xl border border-solid border-border bg-surface p-4 sm:p-5">
            <p className="mt-0 mb-1 text-sm font-semibold text-fg-secondary">문제 정보</p>
            <h2 id="review-problem-title" className="mt-0 mb-2 text-xl font-bold">{reviewAssignment.title}</h2>
            <p className="m-0 whitespace-pre-wrap text-fg-body [overflow-wrap:anywhere]">{reviewProblem?.description || "등록된 문제 설명이 없어요."}</p>
            {reviewProblem && (
              <dl className="mb-0 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "입력 형식", value: reviewProblem.inputFormat },
                  { label: "출력 형식", value: reviewProblem.outputFormat },
                  { label: "시간 제한", value: reviewProblem.timeLimit ? `${reviewProblem.timeLimit}초` : "" },
                  { label: "메모리 제한", value: reviewProblem.memoryLimit ? `${reviewProblem.memoryLimit} MB` : "" },
                ].map(({ label, value }) => (
                  <div key={label} className="min-w-0 rounded-lg bg-bg p-3">
                    <dt className="text-sm font-semibold text-fg-secondary">{label}</dt>
                    <dd className="mt-1 ml-0 whitespace-pre-wrap text-fg [overflow-wrap:anywhere]">{value || "미설정"}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        )}
        {assignment && <div className="review-callout"><span><ShieldCheck size={20} /></span><div><b>선택 검토 작업</b><small>이 화면에서는 조정이 필요한 제출만 처리해요. 나머지 제출은 점수 공개 시점에 자동 채점 점수로 일괄 확정됩니다.</small></div></div>}
        <div className={current ? "review-layout" : undefined}>
          <section className="review-list-card">
            <header>
              <div><h2>{assignment ? "같은 과제의 답안" : "과제별 학생 답안"}</h2><p>학생을 선택해 제출 답안을 확인하세요.</p></div>
              <span aria-label={`검토 대기 ${pendingCount}건`}>{pendingCount}</span>
            </header>
            <label className="review-list-search">
              <Search size={15} aria-hidden />
              <input aria-label="학생 또는 문제 검색" placeholder="학생 또는 문제 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <div className="review-items">
              {Array.from(reviewGroups, ([key, items]) => (
                <section key={key} aria-labelledby={`review-group-${key}`}>
                  <h3 id={`review-group-${key}`} className="m-0 flex items-center justify-between gap-2 border-0 border-t border-solid border-border bg-bg px-4 py-2 text-sm text-fg">
                    {assignmentTitles.get(key) ?? items[0].problem}
                    <span className="shrink-0 text-xs font-medium text-fg-secondary">{items.length}건</span>
                  </h3>
                  <ul className="m-0 list-none p-0">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button type="button" className={`review-item ${current?.id === item.id ? "selected" : ""}`}
                          aria-pressed={current?.id === item.id} onClick={() => selectSubmission(item)}>
                          <span className="student-avatar" aria-hidden>{item.name.slice(0, 1)}</span>
                          <span className="student-info"><b>{item.name}</b><small>{item.studentId}</small><small>자동 점수 {item.score}점</small></span>
                          <span className="flag-chip">FLAG {item.flagCount}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              {visibleReviews.length === 0 && <p className="review-empty">{query.trim() ? "검색 결과가 없습니다." : "검토할 제출이 없습니다."}</p>}
            </div>
          </section>
          {current && <section className="review-detail"><header className="submission-header"><span className="student-avatar large">{current.name.slice(0, 1)}</span><div className="submission-student"><div><b>{current.name}</b><span>{current.studentId}</span></div><small>제출 #SUB-20250522-{String(current.id).padStart(4, "0")} · Python 3.12</small></div><div className="auto-score"><small>자동 점수</small><b>{current.score}<span>/100</span></b></div></header>
            <section aria-labelledby="review-answer-title" className="mt-4 rounded-xl border border-solid border-border bg-bg p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 id="review-answer-title" className="m-0 text-base">{current.name} 제출 답안</h3>
                  <p className="mt-1 mb-0 text-sm text-fg-secondary">과제 · {reviewAssignment?.title ?? current.problem}</p>
                </div>
                <button type="button" className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-solid border-border bg-surface px-3 py-2 text-sm text-fg"
                  onClick={() => setShowCode(true)}><Eye size={16} aria-hidden /> 전체 코드 보기</button>
              </div>
              <pre className="mt-3 mb-0 max-h-48 overflow-auto rounded-lg bg-surface p-3 font-mono text-sm"><code>{current.fullCode}</code></pre>
            </section>
            <div className="evidence-grid"><section className="flag-panel"><header><span className="panel-icon"><Flag size={16} /></span><div><b>허용 범위 위반</b><small>FLAG · 검토 필요</small></div><strong>FLAG</strong></header><div className="flag-meta"><div><small>위반 태그</small><code>{current.tag}</code></div><div><small>줄 번호</small><b>{current.line}번째 줄</b></div></div><div className="flag-code"><small>해당 코드</small><pre>{current.code}</pre></div><footer><small>FLAG는 오답이 아니며 자동 점수에 영향을 주지 않습니다.</small></footer></section>
              <section className="leave-panel"><header><span className="leave-icon"><Eye size={17} /></span><div><b>화면 이탈 기록</b><small>참고</small></div><strong>{current.exits}회</strong></header><div className="leave-stats"><div><small>이탈 횟수</small><b>{current.exits}회</b></div><div><small>총 이탈 시간</small><b>{current.awaySeconds >= 60 ? `${Math.floor(current.awaySeconds / 60)}분 ${current.awaySeconds % 60}초` : `${current.awaySeconds}초`}</b></div></div><ul>{current.times.map((time) => <li key={time}>{time}</li>)}{current.times.length === 0 && <li>화면 이탈 기록이 없습니다.</li>}</ul><footer>정상적인 참고 자료로 확인할 수 있어요. 점수에는 반영되지 않습니다.</footer></section></div>
            <section className="group-scores"><h3>그룹별 점수</h3><div className="group-score-row"><div><b>그룹 A</b><small>기본 케이스 · {current.groupATotal === current.groupA ? "3/3" : "2/3"} 통과</small></div><strong>{current.groupA} / {current.groupATotal}</strong></div><div className="group-score-row"><div><b>그룹 B</b><small>대용량 입력 · {current.groupBTotal === current.groupB ? "7/7" : "5/7"} 통과</small></div><strong>{current.groupB} / {current.groupBTotal}</strong></div></section>
            <div className="score-equation"><div><small>그룹 점수 합</small><b>{current.score}</b></div><span>−</span><div><small>지각 감점</small><b>0</b></div><span>±</span><div><small>교수 조정</small><b>{adjustment}</b></div><span>=</span><div className="final-score-box"><small>확정 점수</small><b>{finalScore}</b></div></div>
            <section className="adjustment-panel"><h3>교수 조정</h3><p>점수를 조정하거나 확정할 때 사유 입력은 필수입니다.</p><label htmlFor="adjustment-score">조정 점수</label><input id="adjustment-score" type="number" min="-100" max="100" value={adjustment} onChange={(e) => updateAdjustment(e.target.value)} /><label htmlFor="adjustment-reason">조정 사유</label><textarea id="adjustment-reason" value={reason} onChange={(e) => setReasons((items) => ({ ...items, [current.id]: e.target.value }))} placeholder="학생에게 전달할 조정 사유를 입력하세요" /><small className="private-note"><Eye size={15} /> 확정 전까지 학생에게 보이지 않아요.</small><div className="confirmed-total"><span>최종 확정 점수</span><b>{finalScore}<small>/100</small></b></div><footer><button className="hold-button" onClick={() => resolveReview("held")}>보류</button><button className="confirm-button" onClick={() => resolveReview("confirmed")} disabled={adjustment !== 0 && !reason.trim()}>점수 확정</button></footer></section>
          </section>}
        </div>
      </main></div>
    {toast && <div className="review-toast"><Check size={17} />{toast}<button onClick={() => setToast("")} aria-label="알림 닫기"><X size={15} /></button></div>}
    {showCode && current && <div className="code-modal-backdrop" onClick={() => setShowCode(false)}><section className="code-modal" onClick={(e) => e.stopPropagation()}><header><div><h2>제출 코드</h2><p>{current.name} · {reviewAssignment?.title ?? current.problem}</p></div><button onClick={() => setShowCode(false)} aria-label="닫기"><X size={19} /></button></header><pre>{current.fullCode}</pre><footer><button onClick={() => setShowCode(false)}>닫기</button></footer></section></div>}
    <style>{styles}</style>
  </ProfessorLayout>;
}

import styles from "./ProblemEditor.css?inline";
import { ProfessorLayout } from "../components/layout/ProfessorSidebar";
import { useRef, useState } from "react";
import { Bell, BookOpen, Check, FlaskConical, Plus, ShieldCheck, X } from "lucide-react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { readEditableProblem } from "./professorAssignments";
import { readProfessorClasses } from "./professorClassData";
import { InspectionPolicyEditor } from "./InspectionPolicyEditor";
import { saveProblem, type InspectionPolicy, type TestCase } from "./savedProblems";

const steps = [
  { title: "문제 입력", description: "문제와 실행 조건", icon: BookOpen },
  { title: "테스트케이스 설정", description: "입력과 출력 예제", icon: FlaskConical },
  { title: "정책 설정", description: "제출·공개 및 검사 정책", icon: ShieldCheck },
];

export function ProblemEditor() {
  const { problemKey } = useParams();
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section");
  const editStep = section === "cases" ? 1 : section === "policy" ? 2 : 0;
  const courseId = searchParams.get("course");
  return <ProblemEditorForm key={problemKey ? `${problemKey}-${editStep}` : courseId ?? "new"} problemKey={problemKey} editStep={editStep} courseId={courseId} />;
}

function ProblemEditorForm({ problemKey, editStep, courseId }: { problemKey?: string; editStep: number; courseId: string | null }) {
  const navigate = useNavigate();
  const [entry] = useState(() => {
    try { return problemKey ? readEditableProblem(problemKey) : undefined; }
    catch { return undefined; }
  });
  const original = entry?.problem;
  const linkedCourseId = problemKey ? original?.classId : courseId;
  const course = readProfessorClasses().find((item) => item.id === linkedCourseId);
  const returnPath = !problemKey && course ? `/classes?course=${encodeURIComponent(course.id)}&tab=assignments` : "/problems";
  const [title, setTitle] = useState(original?.title ?? "이진 탐색 구현");
  const [description, setDescription] = useState(original?.description ?? "정렬된 정수 배열과 찾고자 하는 값이 주어질 때, 이진 탐색을 사용하여 값의 인덱스를 반환하세요.");
  const [inputFormat, setInputFormat] = useState(original?.inputFormat ?? "");
  const [outputFormat, setOutputFormat] = useState(original?.outputFormat ?? "");
  const [timeLimit, setTimeLimit] = useState(original?.timeLimit ?? "1");
  const [memoryLimit, setMemoryLimit] = useState(original?.memoryLimit ?? "128");
  const [deadline, setDeadline] = useState(original?.deadline ?? "");
  const [resubmission, setResubmission] = useState(original?.resubmission ?? true);
  const [trackLeave, setTrackLeave] = useState(original?.trackLeave ?? false);
  const [inspectionPolicy, setInspectionPolicy] = useState<InspectionPolicy>(
    original?.inspectionPolicy ?? { mode: "deny", deniedTags: [], allowedTags: [], requiredTags: [] },
  );
  const originalPublishAt = Date.parse(original?.publishAt ?? "");
  const [publishImmediately, setPublishImmediately] = useState(!Number.isFinite(originalPublishAt));
  const [publishDateTime, setPublishDateTime] = useState(() => {
    if (!Number.isFinite(originalPublishAt)) return "";
    const date = new Date(originalPublishAt);
    return new Date(originalPublishAt - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
  });
  const [step, setStep] = useState(editStep);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const [testCases, setTestCases] = useState<TestCase[]>(original?.testCases ?? []);
  const nextCaseId = useRef(Math.max(0, ...testCases.map((item) => item.id)) + 1);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const addTestCase = () => {
    const testCase: TestCase = { id: nextCaseId.current++, input: "", expectedOutput: "", visibility: "private" };
    setTestCases((cases) => [...cases, testCase]);
  };
  const updateTestCase = (id: number, changes: Partial<Omit<TestCase, "id">>) => {
    setTestCases((cases) => cases.map((testCase) => testCase.id === id ? { ...testCase, ...changes } : testCase));
  };
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const moveToStep = (nextStep: number) => {
    setStep(nextStep);
    window.requestAnimationFrame(() => stepHeading.current?.focus());
  };
  const validateProblem = () => {
    if (!title.trim() || !description.trim()) {
      notify("과제 제목과 설명을 입력해주세요.");
      return false;
    }
    return true;
  };
  const nextStep = () => {
    if (step === 0 && !validateProblem()) return;
    moveToStep(step + 1);
  };
  const save = (publish: boolean) => {
    if (saved) return;
    if (!problemKey && courseId && !course) { notify("등록할 수업을 찾지 못했어요."); return; }
    if (!validateProblem()) { if (step !== 0) moveToStep(0); return; }
    const updatePublication = Boolean(original) || publish;
    const scheduled = updatePublication && !publishImmediately;
    const publicationTime = Date.parse(publishDateTime);
    const samePublicationTime = Math.floor(originalPublishAt / 60_000) === Math.floor(publicationTime / 60_000);
    if (scheduled && (!Number.isFinite(publicationTime) || (!samePublicationTime && publicationTime <= Date.now()))) {
      notify("공개 날짜와 시간을 현재 시각 이후로 설정해주세요.");
      if (step !== 2) moveToStep(2);
      return;
    }
    const status = original
      ? updatePublication && original.status !== "초안" ? scheduled ? "공개 예약" : "공개" : original.status
      : scheduled ? "공개 예약" : publish ? "공개" : "초안";
    const publishAt = !updatePublication ? original?.publishAt
      : scheduled ? samePublicationTime ? original?.publishAt : new Date(publicationTime).toISOString() : undefined;
    try {
      saveProblem({
        sampleId: original?.sampleId, classId: original ? original.classId : course?.id,
        title: title.trim(), description, inputFormat, outputFormat, timeLimit, memoryLimit,
        deadline, resubmission, trackLeave, testCases, inspectionPolicy,
        status, publishAt,
      }, entry?.index);
    } catch {
      notify("문제를 저장하지 못했어요. 브라우저 저장 공간을 확인해주세요.");
      return;
    }
    setSaved(true);
    notify(original ? "변경사항을 저장했어요." : scheduled ? "문제 공개를 예약했어요." : publish ? "문제를 공개했어요." : "문제를 초안으로 저장했어요.");
    window.setTimeout(() => navigate(returnPath), 900);
  };

  if (problemKey && !original) {
    return <ProfessorLayout onNotify={notify}>
      <main className="p-8"><h1>문제를 찾지 못했어요.</h1><Link to="/problems">문제 목록으로 돌아가기</Link></main>
    </ProfessorLayout>;
  }

  return <ProfessorLayout onNotify={notify}>
    <div className="editor-main">
      <header className="editor-topbar"><div className="editor-search"><span>⌕</span><input placeholder="문제, 학생 또는 제출 ID 검색" aria-label="전체 검색" /></div><button className="editor-bell" aria-label="알림" onClick={() => notify("새 알림이 없습니다.")}><Bell size={22} /><i /></button><div className="editor-profile"><b>박서연 교수</b><small>컴퓨터공학과</small></div></header>
      <main className="editor-content">
        <div className="editor-title-row">
          <div>
            <p className="editor-eyebrow">{original ? original.title : `${course?.title ?? "PROFESSOR"} · NEW ASSIGNMENT`}</p>
            <h1>{original ? "문제 수정" : "새 문제 만들기"}</h1>
            <p>{["과제 내용과 실행 조건을 입력하세요.", "채점에 사용할 테스트케이스를 등록하세요.", "과제의 제출·공개 및 검사 정책을 설정하세요."][step]}</p>
          </div>
          <div className="editor-title-actions">
            {original && <Link className="editor-secondary no-underline" to={returnPath}>문제 목록으로 돌아가기</Link>}
            {!original && course && <Link className="editor-secondary no-underline" to={returnPath}>수업으로 돌아가기</Link>}
            {!original && <button type="button" className="editor-secondary" disabled={saved} onClick={() => save(false)}>초안 저장</button>}
          </div>
        </div>

        <ol aria-label={original ? "과제 수정 단계" : "과제 등록 단계"} className="editor-card m-0 mb-6 grid list-none gap-4 p-5 sm:grid-cols-3 sm:gap-5">
          {steps.map(({ title, description, icon: Icon }, index) => {
            const active = index === step;
            const complete = index < step;
            return (
              <li key={title} className="flex min-w-0 items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  aria-current={active ? "step" : undefined}
                  disabled={saved}
                  className="flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent p-1 text-left hover:bg-info-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-default sm:gap-4"
                  onClick={() => { if (!active) moveToStep(index); }}
                >
                <span className={`grid size-11 shrink-0 place-items-center rounded-full border border-solid sm:size-14 ${active ? "border-blue-600 bg-blue-600 text-white ring-4 ring-info-bg" : complete ? "border-info-border bg-info-bg text-info-text" : "border-border bg-neutral-bg text-fg-secondary"}`}>
                  {complete ? <Check size={23} aria-hidden /> : <Icon size={23} aria-hidden />}
                </span>
                <span className={active ? "text-blue-600" : "text-fg-secondary"}>
                  <span className="block text-xs font-bold tracking-wide">STEP {index + 1}</span>
                  <b className="block text-sm sm:text-base">{title}</b>
                  <span className="block text-xs">{description}</span>
                </span>
                </button>
                {index < steps.length - 1 && <span aria-hidden className="hidden h-px flex-1 bg-border lg:block" />}
              </li>
            );
          })}
        </ol>

        {step === 0 && (
          <div className="grid gap-5">
            <section className="editor-card basic-card">
              <h2 ref={stepHeading} tabIndex={-1}>기본 정보</h2>
              <label htmlFor="problem-title">과제 제목</label>
              <input id="problem-title" className="editor-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="문제 제목을 입력하세요" />
              <label htmlFor="problem-description">과제 설명</label>
              <textarea id="problem-description" className="editor-textarea description-area" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="문제의 설명을 입력하세요." />
              <div className="format-columns">
                <div>
                  <label htmlFor="input-format">입력 형식</label>
                  <textarea id="input-format" className="editor-textarea format-area" value={inputFormat} onChange={(e) => setInputFormat(e.target.value)} placeholder="입력값의 형식을 설명하세요." />
                </div>
                <div>
                  <label htmlFor="output-format">출력 형식</label>
                  <textarea id="output-format" className="editor-textarea format-area" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} placeholder="출력값의 형식을 설명하세요." />
                </div>
              </div>
            </section>
            <section className="editor-card execution-card">
              <h2>실행 조건</h2>
              <div className="language-box">
                <div>
                  <b>채점 언어</b>
                  <small>이 서비스는 Python 과제만 지원합니다.</small>
                </div>
                <strong>Python 3.12</strong>
              </div>
              <div className="limit-fields">
                <div>
                  <label htmlFor="time-limit">시간 제한</label>
                  <div className="unit-input">
                    <input id="time-limit" type="number" min="1" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
                    <span>초</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="memory-limit">메모리 제한</label>
                  <div className="unit-input">
                    <input id="memory-limit" type="number" min="16" value={memoryLimit} onChange={(e) => setMemoryLimit(e.target.value)} />
                    <span>MB</span>
                  </div>
                </div>
              </div>
              <label htmlFor="problem-deadline">제출 마감</label>
              <input id="problem-deadline" className="editor-input date-input" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </section>
          </div>
        )}
        {step === 1 && (
          <section className="editor-card testcase-card" aria-labelledby="testcase-heading">
            <header className="testcase-header">
              <h2 id="testcase-heading" ref={stepHeading} tabIndex={-1}>등록된 테스트케이스</h2>
              <span className="rounded-full bg-info-bg px-3 py-1 text-sm font-semibold text-info-text">등록 {testCases.length}개</span>
            </header>
            {testCases.length === 0 && <p className="testcase-empty">등록된 테스트케이스가 없습니다.</p>}
            {testCases.map((testCase, index) => (
              <fieldset className="testcase-fields" key={testCase.id}>
                <legend>케이스 {index + 1}</legend>
                <div className="testcase-options">
                  <label>
                    공개 여부
                    <select className="editor-input" value={testCase.visibility} onChange={(event) => updateTestCase(testCase.id, { visibility: event.target.value === "public" ? "public" : "private" })}>
                      <option value="private">비공개</option>
                      <option value="public">공개</option>
                    </select>
                  </label>
                  <button type="button" className="editor-secondary" aria-label={`케이스 ${index + 1} 삭제`} onClick={() => setTestCases((cases) => cases.filter((item) => item.id !== testCase.id))}>삭제</button>
                </div>
                <div className="format-columns">
                  <div>
                    <label htmlFor={`case-input-${testCase.id}`}>입력값</label>
                    <textarea id={`case-input-${testCase.id}`} className="editor-textarea testcase-value" rows={3} spellCheck={false} value={testCase.input} onChange={(event) => updateTestCase(testCase.id, { input: event.target.value })} />
                  </div>
                  <div>
                    <label htmlFor={`case-output-${testCase.id}`}>기대 출력값</label>
                    <textarea id={`case-output-${testCase.id}`} className="editor-textarea testcase-value" rows={3} spellCheck={false} value={testCase.expectedOutput} onChange={(event) => updateTestCase(testCase.id, { expectedOutput: event.target.value })} />
                  </div>
                </div>
              </fieldset>
            ))}
            <button
              type="button"
              className="mt-4 flex w-full cursor-pointer items-center gap-3 rounded-lg border border-solid border-border bg-bg px-4 py-3 text-left text-sm font-semibold text-fg hover:border-info-border hover:bg-info-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              onClick={addTestCase}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-dashed border-info-border bg-surface text-blue-600">
                <Plus size={18} aria-hidden />
              </span>
              테스트케이스 추가
            </button>
          </section>
        )}
        {step === 2 && (
          <div className="grid gap-5">
            <InspectionPolicyEditor policy={inspectionPolicy} onChange={setInspectionPolicy} disabled={saved} />
            <section className="editor-card policy-card">
              <h2 ref={stepHeading} tabIndex={-1}>제출 정책</h2>
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
                <div className="rounded-xl border border-solid border-border p-3">
                  <div className="policy-row">
                    <div>
                      <b>문제 공개 시점</b>
                      <small>{original?.status === "초안" ? "초안에 공개 설정을 저장해요." : "바로 공개하거나 공개 일시를 예약할 수 있어요."}</small>
                    </div>
                    <label className="publish-immediately">
                      <input
                        type="checkbox"
                        checked={publishImmediately}
                        onChange={(event) => setPublishImmediately(event.target.checked)}
                      />
                      바로 공개
                    </label>
                  </div>
                  {!publishImmediately && (
                    <div className="mt-3">
                      <label htmlFor="problem-publish-at">공개 날짜 및 시간</label>
                      <input
                        id="problem-publish-at"
                        className="editor-input date-input"
                        type="datetime-local"
                        value={publishDateTime}
                        onChange={(event) => setPublishDateTime(event.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-solid border-border p-3">
                  <div className="policy-row">
                    <div>
                      <b>재제출 허용</b>
                      <small>마감 전까지 여러 번 제출 가능</small>
                    </div>
                    <input type="checkbox" checked={resubmission} onChange={(e) => setResubmission(e.target.checked)} aria-label="재제출 허용" />
                  </div>
                </div>
                <div className="rounded-xl border border-solid border-border p-3">
                  <div className="policy-row">
                    <div>
                      <b>화면 이탈 기록 사용</b>
                      <small>화면 활성이 풀린 횟수와 벗어난 시간을 참고용으로 기록돼요. 점수에는 반영되지 않아요.</small>
                    </div>
                    <button type="button" className={`editor-switch ${trackLeave ? "enabled" : ""}`} role="switch" aria-checked={trackLeave} onClick={() => setTrackLeave((value) => !value)} aria-label="화면 이탈 기록 사용">
                      <span />
                    </button>
                  </div>
                </div>
              </div>
              <div className="release-policy">
                <ShieldCheck size={17} />
                <div>
                  <b>점수 공개 정책</b>
                  <small>교수가 확정한 점수만 학생에게 공개됩니다.</small>
                </div>
              </div>
            </section>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          {step > 0 && <button type="button" className="editor-secondary" disabled={saved} onClick={() => moveToStep(step - 1)}>이전</button>}
          {step < steps.length - 1 && (
            <button type="button" className={original ? "editor-secondary" : "editor-primary"} disabled={saved} onClick={nextStep}>다음</button>
          )}
          {original ? (
            <button type="button" className="editor-primary" disabled={saved} onClick={() => save(false)}>변경사항 저장</button>
          ) : step === steps.length - 1 && (
            <button type="button" className="editor-primary" disabled={saved} onClick={() => save(true)}>
              문제 등록
            </button>
          )}
        </div>
      </main>
    </div>
    {toast && <div className="editor-toast"><Check size={17} />{toast}<button onClick={() => setToast("")} aria-label="알림 닫기"><X size={15} /></button></div>}
    <style>{styles}</style>
  </ProfessorLayout>;
}

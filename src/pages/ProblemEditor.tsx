import styles from "./ProblemEditor.css?inline";
import { ProfessorLayout } from "../components/layout/ProfessorSidebar";
import { useState } from "react";
import { Bell, Check, ShieldCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProblemEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("이진 탐색 구현");
  const [description, setDescription] = useState("정렬된 정수 배열과 찾고자 하는 값이 주어질 때, 이진 탐색을 사용하여 값의 인덱스를 반환하세요.");
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [timeLimit, setTimeLimit] = useState("1");
  const [memoryLimit, setMemoryLimit] = useState("128");
  const [deadline, setDeadline] = useState("2025-05-31T23:59");
  const [resubmission, setResubmission] = useState(true);
  const [trackLeave, setTrackLeave] = useState(false);
  const [toast, setToast] = useState("");
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const save = (publish: boolean) => {
    if (!title.trim() || !description.trim()) { notify("문제 제목과 설명을 입력해주세요."); return; }
    notify(publish ? "문제를 공개했어요." : "문제를 초안으로 저장했어요.");
    window.setTimeout(() => navigate("/problems"), 900);
  };

  return <ProfessorLayout onNotify={notify}>
    <div className="editor-main">
      <header className="editor-topbar"><div className="editor-search"><span>⌕</span><input placeholder="문제, 학생 또는 제출 ID 검색" aria-label="전체 검색" /></div><button className="editor-bell" aria-label="알림" onClick={() => notify("새 알림이 없습니다.")}><Bell size={22} /><i /></button><div className="editor-profile"><b>박서연 교수</b><small>컴퓨터공학과</small></div></header>
      <main className="editor-content"><div className="editor-title-row"><div><p className="editor-eyebrow">PROFESSOR · PROBLEM EDITOR</p><h1>새 문제 만들기</h1><p>문제 정보와 실행 조건을 입력하세요.</p></div><div className="editor-title-actions"><button className="editor-secondary" onClick={() => save(false)}>초안 저장</button><button className="editor-primary" onClick={() => save(true)}>문제 공개</button></div></div>
        <div className="editor-columns"><section className="editor-card basic-card"><h2>기본 정보</h2><label htmlFor="problem-title">문제 제목</label><input id="problem-title" className="editor-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="문제 제목을 입력하세요" />
          <label htmlFor="problem-description">문제 설명</label><textarea id="problem-description" className="editor-textarea description-area" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="문제의 설명을 입력하세요." />
          <div className="format-columns"><div><label htmlFor="input-format">입력 형식</label><textarea id="input-format" className="editor-textarea format-area" value={inputFormat} onChange={(e) => setInputFormat(e.target.value)} placeholder="입력값의 형식을 설명하세요." /></div><div><label htmlFor="output-format">출력 형식</label><textarea id="output-format" className="editor-textarea format-area" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} placeholder="출력값의 형식을 설명하세요." /></div></div>
        </section>
        <div className="editor-right-column"><section className="editor-card execution-card"><h2>실행 조건</h2><div className="language-box"><div><b>채점 언어</b><small>이 서비스는 Python 과제만 지원합니다.</small></div><strong>Python 3.12</strong></div><div className="limit-fields"><div><label htmlFor="time-limit">시간 제한</label><div className="unit-input"><input id="time-limit" type="number" min="1" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} /><span>초</span></div></div><div><label htmlFor="memory-limit">메모리 제한</label><div className="unit-input"><input id="memory-limit" type="number" min="16" value={memoryLimit} onChange={(e) => setMemoryLimit(e.target.value)} /><span>MB</span></div></div></div><label htmlFor="problem-deadline">제출 마감</label><input id="problem-deadline" className="editor-input date-input" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></section>
          <section className="editor-card policy-card"><h2>제출 정책</h2><div className="policy-row"><div><b>재제출 허용</b><small>마감 전까지 여러 번 제출 가능</small></div><input type="checkbox" checked={resubmission} onChange={(e) => setResubmission(e.target.checked)} aria-label="재제출 허용" /></div><div className="policy-row"><div><b>화면 이탈 기록 사용</b><small>화면 활성이 풀린 횟수와 벗어난 시간을 참고용으로 기록돼요. 점수에는 반영되지 않아요.</small></div><button className={`editor-switch ${trackLeave ? "enabled" : ""}`} role="switch" aria-checked={trackLeave} onClick={() => setTrackLeave((value) => !value)} aria-label="화면 이탈 기록 사용"><span /></button></div><div className="release-policy"><ShieldCheck size={17} /><div><b>점수 공개 정책</b><small>교수가 확정한 점수만 학생에게 공개됩니다.</small></div></div></section></div></div>
      </main>
    </div>
    {toast && <div className="editor-toast"><Check size={17} />{toast}<button onClick={() => setToast("")} aria-label="알림 닫기"><X size={15} /></button></div>}
    <style>{styles}</style>
  </ProfessorLayout>;
}

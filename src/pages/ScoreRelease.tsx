import styles from "./ScoreRelease.css?inline";
import { ProfessorLayout } from "../components/layout/ProfessorSidebar";
import { useState } from "react";
import { Bell, Check, Flag, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ReleaseTask = { id: number; title: string; course: string; submitted: number; total: number; pending: number; released: boolean; scheduledAt?: string };
const initialTasks: ReleaseTask[] = [
  { id: 1, title: "괄호 문자열 검사", course: "자료구조", submitted: 48, total: 60, pending: 7, released: false },
  { id: 2, title: "두 수의 합", course: "Python 기초", submitted: 60, total: 60, pending: 0, released: true },
  { id: 3, title: "최단 경로 찾기", course: "알고리즘", submitted: 44, total: 52, pending: 3, released: false },
];

export function ScoreRelease() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedId, setSelectedId] = useState(1);
  const [mode, setMode] = useState<"now" | "scheduled">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [toast, setToast] = useState("");
  const selected = tasks.find((task) => task.id === selectedId) ?? tasks[0];
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const release = () => {
    if (mode === "scheduled" && !scheduledAt) { notify("점수를 공개할 날짜와 시간을 선택해주세요."); return; }
    if (mode === "now") {
      setTasks((items) => items.map((item) => item.id === selectedId ? { ...item, released: true, pending: 0, scheduledAt: undefined } : item));
      notify(`${selected.title} 점수를 공개했어요.`);
    } else {
      setTasks((items) => items.map((item) => item.id === selectedId ? { ...item, scheduledAt } : item));
      notify(`${new Date(scheduledAt).toLocaleString("ko-KR")}에 공개하도록 예약했어요.`);
    }
  };

  return <ProfessorLayout onNotify={notify}>
    <div className="release-main"><header className="release-topbar"><div className="release-search"><span>⌕</span><input placeholder="문제, 학생 또는 제출 ID 검색" aria-label="전체 검색" /></div><button aria-label="알림" className="release-bell" onClick={() => notify("새 알림이 없습니다.")}><Bell size={22} /><i /></button><div className="release-profile"><b>박서연 교수</b><small>컴퓨터공학과</small></div></header>
      <main className="release-content"><div className="release-heading"><p>PROFESSOR · SCORE RELEASE</p><h1>점수 공개</h1><span>과제별 확정 상태를 확인하고 학생에게 점수를 공개하세요.</span></div>
        <div className="release-layout"><section className="release-list"><header><h2>과제별 공개 현황</h2><p>과제를 선택해 공개 방식을 설정하세요.</p></header><div className="release-table-wrap"><table><thead><tr><th>과제</th><th>제출 수</th><th>미확정</th><th>공개 상태</th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id} className={task.id === selectedId ? "selected" : ""} onClick={() => setSelectedId(task.id)}><td><b>{task.title}</b><small>{task.course}</small></td><td><b>{task.submitted} / {task.total}</b></td><td><span className={`pending-badge ${task.pending === 0 ? "none" : ""}`}>{task.pending}건</span></td><td><span className={`release-status ${task.released ? "done" : ""}`}>{task.released ? "공개 완료" : "공개 전"}</span></td></tr>)}</tbody></table></div></section>
          <section className="release-settings"><header><div><span className="course-badge">{selected.course}</span><span className={`release-status top-status ${selected.released ? "done" : ""}`}>{selected.released ? "공개 완료" : "공개 전"}</span><h2>{selected.title}</h2><p>제출 {selected.submitted} / {selected.total} · 미확정 {selected.pending}건</p></div></header><div className="release-mode"><h3>공개 방식</h3><button className={`mode-option ${mode === "now" ? "chosen" : ""}`} onClick={() => setMode("now")}><span className="radio-dot" /><span><b>지금 바로 공개</b><small>확인 즉시 모든 학생에게 점수를 공개합니다.</small></span></button><button className={`mode-option ${mode === "scheduled" ? "chosen" : ""}`} onClick={() => setMode("scheduled")}><span className="radio-dot" /><span><b>예약 공개</b><small>지정한 날짜와 시간에 자동으로 공개합니다.</small></span></button>{mode === "scheduled" && <label className="schedule-field">공개 날짜 및 시간<input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} /></label>}
            {selected.pending > 0 && <div className="pending-warning"><Flag size={17} /><div><b>미확정 제출이 있어요</b><p>미확정 {selected.pending}건은 공개 시점에 자동 채점 점수로 일괄 확정돼요. FLAG 검토 중인 제출도 포함돼요.</p></div></div>}
          </div><footer className="release-actions"><button className="review-pending" onClick={() => navigate("/review")}>미확정 검토하기</button><button className="publish-scores" onClick={release} disabled={selected.released}>{selected.released ? "공개 완료" : mode === "now" ? "점수 공개" : "공개 예약"}</button></footer></section></div>
      </main></div>
    {toast && <div className="release-toast"><Check size={17} />{toast}<button onClick={() => setToast("")} aria-label="알림 닫기"><X size={15} /></button></div>}
    <style>{styles}</style>
  </ProfessorLayout>;
}

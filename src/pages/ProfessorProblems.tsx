import styles from "./ProfessorProblems.css?inline";
import { ProfessorLayout } from "../components/layout/ProfessorSidebar";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Clock3, Flag, Plus, Search, X } from "lucide-react";

type Assignment = { id: number; title: string; due: string; submitted: number; total: number; flags: number; status: "공개" | "초안" };
const initialAssignments: Assignment[] = [
  { id: 1, title: "두 수의 합", due: "5월 18일 · 마감", submitted: 48, total: 60, flags: 4, status: "공개" },
  { id: 2, title: "괄호 문자열 검사", due: "5월 28일", submitted: 43, total: 60, flags: 3, status: "공개" },
  { id: 3, title: "최단 경로 찾기", due: "5월 31일", submitted: 38, total: 60, flags: 2, status: "공개" },
  { id: 4, title: "우선순위 큐 구현", due: "6월 4일", submitted: 33, total: 60, flags: 0, status: "초안" },
];

export function ProfessorProblems() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState(initialAssignments);
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [toast, setToast] = useState("");
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2400); };
  const filtered = useMemo(() => assignments.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), [assignments, query]);
  const createAssignment = () => {
    const title = newTitle.trim();
    if (!title) return;
    setAssignments((items) => [...items, { id: items.length + 1, title, due: "마감일 미설정", submitted: 0, total: 60, flags: 0, status: "초안" }]);
    setNewTitle(""); setShowNew(false); notify("새 문제 초안을 등록했어요.");
  };

  return <ProfessorLayout onNotify={notify}>
    <div className="problems-main">
      <header className="problems-topbar"><div className="problems-global-search"><Search size={19} /><input placeholder="문제, 학생 또는 제출 ID 검색" aria-label="전체 검색" /></div><button className="problems-notification" aria-label="알림" onClick={() => notify("새 알림이 없습니다.")}><Bell size={22} /><i /></button><div className="problems-profile"><b>박서연 교수</b><small>컴퓨터공학과</small></div></header>
      <main className="problems-content"><div className="problems-title-row"><div><p className="problems-eyebrow">2025년 봄학기 · 알고리즘</p><h1>문제 관리</h1><p className="problems-subtitle">과제를 만들고 학생 제출 및 채점 현황을 관리하세요.</p></div><button className="problems-primary" onClick={() => navigate("/problems/new")}><Plus size={19} /> 새 문제 등록</button></div>
        <section className="problems-stats"><article><span className="stat-icon done"><Check size={21} /></span><div><small>제출 완료</small><div className="stat-value">286 <span>전체 과제 누적</span></div></div></article><article><span className="stat-icon review"><Flag size={21} /></span><div><small>검토 대기</small><div className="stat-value">7 <span>FLAG 제출 7건</span></div></div></article><article><span className="stat-icon grading"><Clock3 size={21} /></span><div><small>채점 중</small><div className="stat-value">12 <span>평균 4.2초 소요</span></div></div></article></section>
        <section className="assignments-card"><header className="assignments-heading"><div><h2>과제 목록</h2><p>마감과 제출 현황을 한눈에 확인하세요.</p></div><label className="assignment-search"><Search size={17} /><input placeholder="과제 검색" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="과제 검색" /></label></header>
          <div className="assignment-table-wrap"><table className="assignment-table"><thead><tr><th>과제</th><th>마감</th><th>제출 수</th><th>FLAG</th><th>상태</th><th>설정</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td><span className="assignment-index">{String(item.id).padStart(2, "0")}</span><b>{item.title}</b></td><td>{item.due}</td><td><b>{item.submitted} / {item.total}</b></td><td><span className={`flag-count ${item.flags === 0 ? "zero" : ""}`}>{item.flags}</span></td><td><span className={`assignment-status ${item.status === "공개" ? "published" : "draft"}`}>{item.status}</span></td><td><div className="row-actions">{["문제", "케이스", "정책"].map((action) => <button key={action} onClick={() => notify(`${item.title} · ${action} 설정은 준비 중이에요.`)}>{action}</button>)}</div></td></tr>)}{filtered.length === 0 && <tr><td colSpan={6} className="no-results">검색한 과제가 없어요.</td></tr>}</tbody></table></div>
        </section>
      </main>
    </div>
    {toast && <div className="problems-toast"><Check size={17} />{toast}<button onClick={() => setToast("")} aria-label="알림 닫기"><X size={15} /></button></div>}
    {showNew && <div className="problems-modal-backdrop" onClick={() => setShowNew(false)}><section className="problems-modal" onClick={(e) => e.stopPropagation()}><header><span><Plus size={21} /></span><div><h2>새 문제 등록</h2><p>과제의 기본 정보를 입력하세요.</p></div><button aria-label="닫기" onClick={() => setShowNew(false)}><X size={20} /></button></header><div className="problems-modal-body"><label htmlFor="new-problem-title">문제명</label><input autoFocus id="new-problem-title" placeholder="예: 배열의 합" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createAssignment()} /></div><footer><button className="problems-cancel" onClick={() => setShowNew(false)}>취소</button><button className="problems-primary" onClick={createAssignment}>문제 등록</button></footer></section></div>}
    <style>{styles}</style>
  </ProfessorLayout>;
}

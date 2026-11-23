import styles from "./ProfessorClasses.css?inline";
import { ProfessorLayout } from "../components/layout/ProfessorSidebar";
import { Tabs } from "../components/ui/Tabs";
import { ClassAssignmentDetails } from "./ClassAssignmentDetails";
import { getAssignmentStatus, readProfessorAssignments, useAssignmentClock } from "./professorAssignments";
import { readProfessorClasses, saveProfessorClasses } from "./professorClassData";
import { useState } from "react";
import { ArrowLeft, Bell, BookOpen, Check, ChevronRight, Code2, Flag, Plus, RotateCcw, Search, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const studentNames = ["김민준", "최준서", "조채원", "임도윤", "박수빈", "강서현", "장예린", "이건우", "정다은", "한유진"];
const departments = ["컴퓨터공학과", "소프트웨어학과", "인공지능학과", "정보통신공학과"];

export function ProfessorClasses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [classes, setClasses] = useState(readProfessorClasses);
  const courseId = searchParams.get("course");
  const legacyIndex = Number(searchParams.get("class") ?? -1);
  const selected = courseId ? classes.findIndex((course) => course.id === courseId) : legacyIndex;
  const detailTab = searchParams.get("tab") === "students" ? "students" : "assignments";
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTerm, setNewTerm] = useState("2026년 2학기");
  const current = classes[selected];
  const [allAssignments] = useState(readProfessorAssignments);
  const now = useAssignmentClock(allAssignments);
  const assignments = allAssignments
    .filter((item) => item.classId === current?.id)
    .map((item) => ({ ...item, status: getAssignmentStatus(item, now) }));
  const assignmentKey = searchParams.get("assignment");
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 2400); };
  const updateClasses = (nextClasses: typeof classes) => {
    try {
      saveProfessorClasses(nextClasses);
    } catch {
      notify("수업을 저장하지 못했어요. 브라우저 저장 공간을 확인해주세요.");
      return false;
    }
    setClasses(nextClasses);
    return true;
  };
  const toggleOpen = () => {
    if (current) updateClasses(classes.map((item, i) => i === selected ? { ...item, open: !item.open } : item));
  };
  const copyCode = async () => {
    if (!current) return;
    try { await navigator.clipboard.writeText(current.code); notify("수업 코드를 복사했어요."); }
    catch { notify(`수업 코드: ${current.code}`); }
  };
  const regenerate = () => {
    if (!current) return;
    const code = `${current.code.slice(0, 2)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
    setClasses((items) => items.map((item, i) => i === selected ? { ...item, code } : item));
    notify("새 참여 코드를 발급했어요.");
  };
  const createClass = () => {
    const title = newName.trim();
    if (!title) return;
    const next = { id: `local-${classes.length}`, title, term: newTerm, count: 0, code: `CL-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 4).toUpperCase()}`, open: true };
    if (!updateClasses([...classes, next])) return;
    setNewName(""); setNewTerm("2026년 2학기"); setShowNew(false); notify("새 수업을 만들었어요.");
  };
  const filteredClasses = classes.map((item, index) => ({ item, index })).filter(({ item }) => item.title.toLowerCase().includes(query.toLowerCase()) || item.code.toLowerCase().includes(query.toLowerCase()));

  return <ProfessorLayout onNotify={notify}>

    <div className="prof-main">
      <header className="prof-topbar"><div className="global-search"><Search size={19} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="문제, 학생 또는 제출 ID 검색" aria-label="수업 검색" /></div><button className="notification" aria-label="알림" onClick={() => notify("새 알림이 없습니다.")}><Bell size={22} /><i /></button><div className="profile"><b>박서연 교수</b><small>컴퓨터공학과</small></div></header>
      <main className="prof-content" id="classes">
        <div className="page-title-row"><div><p className="page-eyebrow">PROFESSOR · CLASSES</p><h1>{current ? current.title : "수업 관리"}</h1><p className="page-subtitle">{current ? `${current.term} 수업 정보와 과제·수강생을 확인하세요.` : "내 수업을 선택해 상세 정보와 수강생을 확인하세요."}</p></div>{current ? <Link className="secondary-button no-underline" to="/classes"><ArrowLeft size={16} /> 내 수업 목록</Link> : <button className="primary-button" onClick={() => setShowNew(true)}><Plus size={19} /> 새 수업 만들기</button>}</div>
        {!current ? <section className="classes-card class-list-full"><div className="card-heading"><div><h2>내 수업</h2><p>관리할 수업을 선택하면 상세 정보로 이동해요.</p></div><span className="count-pill">{classes.length}개</span></div>
          <div className="class-table-wrap"><table className="class-table"><thead><tr><th>수업</th><th>학기</th><th>수강생</th><th>수업 코드</th><th>신규 참여</th><th aria-label="상세 보기" /></tr></thead><tbody>
            {filteredClasses.map(({ item, index }) => <tr key={`${item.title}-${index}`} onClick={() => setSearchParams({ course: item.id })}><td><b>{item.title}</b></td><td>{item.term}</td><td><b>{item.count}명</b></td><td className="table-code">{item.code}</td><td><span className={`status-pill ${item.open ? "is-open" : "is-closed"}`}>{item.open ? "열림" : "닫힘"}</span></td><td><ChevronRight size={17} /></td></tr>)}
            {filteredClasses.length === 0 && <tr><td className="empty-row" colSpan={6}>검색 결과가 없어요.</td></tr>}
          </tbody></table></div>
        </section> : <div className="class-detail-view">
          <section className="class-overview-card"><header><span className="detail-icon"><Code2 size={21} /></span><div><h2>수업 상세 정보</h2><p>{current.term} · {current.count}명 참여 중</p></div><span className={`open-chip ${current.open ? "" : "closed"}`}>{current.open ? "참여 열림" : "참여 닫힘"}</span></header>
            <div className="overview-body"><div className="overview-code"><small>학생 참여 코드</small><strong>{current.code}</strong><p>학생에게 이 코드를 전달해 수업에 참여하도록 안내하세요.</p></div><div className="overview-controls"><div className="overview-actions"><button className="primary-button" onClick={copyCode}><Code2 size={17} /> 코드 복사</button><button className="secondary-button" onClick={regenerate}><RotateCcw size={18} /> 코드 재발급</button></div><div className="setting-row"><div><b>신규 참여 허용</b><small>{current.open ? "새로운 학생은 코드로 참여할 수 있어요." : "현재 신규 학생의 참여가 닫혀 있어요."}</small></div><button role="switch" aria-checked={current.open} className={`switch ${current.open ? "on" : ""}`} onClick={toggleOpen} aria-label="신규 참여 허용 전환"><span /></button></div><div className="warning-note"><Flag size={15} /><span>재발급하면 이전 코드는 참여할 수 없어요. 이미 참여한 학생은 그대로 유지돼요.</span></div></div></div>
          </section>
          <section className="roster-card">
            <div className="px-4 pt-2 sm:px-[22px]">
              <Tabs
                items={[{ value: "assignments", label: "과제", count: assignments.length }, { value: "students", label: "수강생", count: current.count }]}
                active={detailTab}
                onChange={(tab) => setSearchParams({ course: current.id, tab }, { replace: true })}
                variant="line"
              />
            </div>
            {detailTab === "assignments" ? (
              <div role="tabpanel" aria-label="과제">
                {assignmentKey ? (
                  <ClassAssignmentDetails
                    assignment={assignments.find((item) => item.editKey === assignmentKey)}
                    listPath={`/classes?course=${encodeURIComponent(current.id)}`}
                  />
                ) : <>
                <div className="flex justify-end px-4 py-3 sm:px-[22px]">
                  <Link className="primary-button no-underline" to={`/problems/new?course=${encodeURIComponent(current.id)}`}>
                    <Plus size={18} aria-hidden /> 과제 등록
                  </Link>
                </div>
                <div className="roster-scroll">
                  <table aria-label={`${current.title} 과제 목록`}>
                    <thead><tr><th>과제</th><th>마감</th><th>제출 수</th><th>상태</th><th aria-label="상세 보기" /></tr></thead>
                    <tbody>
                      {assignments.map((assignment) => (
                        <tr
                          key={assignment.id}
                          className={assignment.editKey ? "cursor-pointer hover:bg-[#eaf2ff] focus-within:bg-[#eaf2ff]" : undefined}
                          onClick={() => {
                            if (assignment.editKey) setSearchParams({ course: current.id, assignment: assignment.editKey });
                          }}
                        >
                          <td><b>{assignment.title}</b></td>
                          <td>{assignment.due}</td>
                          <td>{assignment.submitted} / {assignment.total}</td>
                          <td><span className={`status-pill ${assignment.status === "공개" ? "is-open" : "is-closed"}`}>{assignment.status}</span></td>
                          <td className="w-7 text-fg-secondary">
                            {assignment.editKey && (
                              <button
                                type="button"
                                className="grid size-8 cursor-pointer place-items-center rounded-md border-0 bg-transparent p-0 text-inherit focus-visible:outline-2 focus-visible:outline-blue-600"
                                aria-label={`${assignment.title} 상세 보기`}
                              >
                                <ChevronRight size={17} aria-hidden />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {assignments.length === 0 && <tr><td colSpan={5} className="empty-row">등록된 과제가 없어요.</td></tr>}
                    </tbody>
                  </table>
                </div>
                </>}
              </div>
            ) : (
              <div role="tabpanel" aria-label="수강생" className="roster-scroll">
                <table aria-label={`${current.title} 수강생 목록`}>
                  <thead><tr><th>번호</th><th>학과</th><th>학번</th><th>이름</th></tr></thead>
                  <tbody>
                    {Array.from({ length: current.count }, (_, index) => {
                      const rosterIndex = selected * 63 + index;
                      const name = studentNames[rosterIndex % studentNames.length];
                      const studentId = `20251${String(rosterIndex + 1).padStart(3, "0")}`;
                      return (
                        <tr key={studentId}>
                          <td>{index + 1}</td>
                          <td>{departments[rosterIndex % departments.length]}</td>
                          <td>{studentId}</td>
                          <td><span className="roster-student"><span>{name.slice(0, 1)}</span><b>{name}</b></span></td>
                        </tr>
                      );
                    })}
                    {current.count === 0 && <tr><td colSpan={4} className="empty-row">등록된 수강생이 없어요.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>}
      </main>
    </div>
    {toast && <div className="prof-toast"><Check size={17} />{toast}<button onClick={() => setToast("")} aria-label="알림 닫기"><X size={15} /></button></div>}
    {showNew && <div className="modal-backdrop" onClick={() => setShowNew(false)}><section className="new-class-modal" onClick={(e) => e.stopPropagation()}>
      <header className="new-class-header"><span className="new-class-icon"><BookOpen size={23} /></span><div><h2>새 수업 만들기</h2><p>수업 기본 정보를 입력하세요.</p></div><button className="modal-close" onClick={() => setShowNew(false)} aria-label="닫기"><X size={20} /></button></header>
      <div className="new-class-fields"><label htmlFor="class-name">수업명</label><input autoFocus id="class-name" placeholder="예: 자료구조" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createClass()} />
      <label htmlFor="class-term">학기</label><select id="class-term" value={newTerm} onChange={(e) => setNewTerm(e.target.value)}><option>2026년 2학기</option><option>2026년 겨울학기</option></select></div>
      <footer className="new-class-footer"><button className="secondary-button" onClick={() => setShowNew(false)}>취소</button><button className="primary-button" onClick={createClass}>수업 만들기</button></footer>
    </section></div>}
    <style>{styles}</style>
  </ProfessorLayout>;
}

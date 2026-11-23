import styles from "./ProfessorHome.css?inline";
import { ProfessorLayout } from "../components/layout/ProfessorSidebar";
import { Bell, BookOpen, Check, ChevronRight, Clock3, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const courses = [
  { title: "자료구조", term: "2025년 봄학기", code: "DS", students: 60, active: "4개", rate: 80, tone: "blue" },
  { title: "알고리즘", term: "2025년 봄학기", code: "AL", students: 52, active: "3개", rate: 86, tone: "purple" },
  { title: "Python 프로그래밍", term: "2024년 가을학기", code: "PY", students: 48, active: "없음", rate: 100, tone: "green" },
];
const gradingTasks = [
  { title: "괄호 문자열 검사", course: "자료구조", due: "D-2", submitted: "48 / 60", graded: "44건", grading: "4건", flags: "3건" },
  { title: "최단 경로 찾기", course: "알고리즘", due: "D-5", submitted: "38 / 52", graded: "36건", grading: "2건", flags: "2건" },
  { title: "우선순위 큐 구현", course: "자료구조", due: "D-9", submitted: "31 / 60", graded: "31건", grading: "0건", flags: "2건" },
];

export function ProfessorHome() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 2400); };
  return <ProfessorLayout onNotify={notify}>
    <div className="home-main"><header className="home-topbar"><div className="home-search"><span>⌕</span><input placeholder="문제, 학생 또는 제출 ID 검색" aria-label="전체 검색" /></div><button aria-label="알림" onClick={() => notify("새 알림이 없습니다.")}><Bell size={22} /><i /></button><div className="home-profile"><b>박서연 교수</b><small>컴퓨터공학과</small></div></header>
      <main className="home-content"><div className="home-welcome"><div><p>2025년 봄학기</p><h1>안녕하세요, 박서연 교수님</h1><span>수업과 과제 운영 현황을 확인하고 필요한 업무를 이어가세요.</span></div><button onClick={() => navigate("/classes")}>수업 관리 <ChevronRight size={17} /></button></div>
        <section className="home-stats"><button onClick={() => navigate("/classes")}><span className="home-stat-icon courses"><BookOpen size={21} /></span><span><small>진행 중인 수업</small><b>2 <i>전체 수업 3개</i></b></span></button><button onClick={() => navigate("/review")}><span className="home-stat-icon review"><Flag size={21} /></span><span><small>검토 대기</small><b>7 <i>FLAG 제출 확인 필요</i></b></span></button><button onClick={() => navigate("/problems")}><span className="home-stat-icon rate"><Check size={21} /></span><span><small>평균 제출률</small><b>82% <i>진행 중 과제 기준</i></b></span></button></section>
        <section className="home-card course-section"><header><div><h2>수업 현황</h2><p>담당 수업의 수강생과 과제 제출률을 확인하세요.</p></div><button onClick={() => navigate("/classes")}>전체 수업 <ChevronRight size={16} /></button></header><div className="course-rows">{courses.map((course, index) => <button className="course-row" key={course.code} onClick={() => navigate(`/classes?class=${index}`)}><span className={`course-code ${course.tone}`}>{course.code}</span><span className="course-name"><b>{course.title}</b><small>{course.term}</small></span><span className="course-metric"><small>수강생</small><b>{course.students}명</b></span><span className="course-metric active-problems"><small>진행 중 과제</small><b>{course.active}</b></span><span className="course-progress"><span><small>제출률</small><b>{course.rate}%</b></span><i><em style={{ width: `${course.rate}%` }} /></i></span><ChevronRight size={17} className="course-chevron" /></button>)}</div></section>
        <section className="home-card grading-section"><header><div><h2>채점 현황</h2><p>마감 전에 아직 점수가 공개되지 않은 과제 기준입니다.</p></div><button onClick={() => navigate("/review")}>채점 검토 <ChevronRight size={16} /></button></header><div className="grading-summary"><span>점수 공개 전 과제</span><b>3개</b><i>FLAG 검토 7건</i></div><div className="grading-table-wrap"><table className="grading-table"><thead><tr><th>과제</th><th>마감</th><th>제출</th><th>채점 완료</th><th>채점 중</th><th>FLAG</th><th /></tr></thead><tbody>{gradingTasks.map((task) => <tr key={task.title} onClick={() => navigate("/review")}><td><b>{task.title}</b><small>{task.course}</small></td><td><span className="due-badge">{task.due}</span></td><td><b>{task.submitted.split(" /")[0]}</b><small> / {task.submitted.split(" / ")[1]}</small></td><td className="graded-count">{task.graded}</td><td><span className="grading-count">{task.grading}</span></td><td><span className="flag-count-home">{task.flags}</span></td><td><ChevronRight size={17} /></td></tr>)}</tbody></table></div><footer><Clock3 size={15} /> 점수 공개 후에는 이 현황에서 제외되며 점수 공개 화면에서 확인할 수 있습니다.</footer></section>
      </main></div>
    {toast && <div className="home-toast">{toast}<button onClick={() => setToast("")}>×</button></div>}
    <style>{styles}</style>
  </ProfessorLayout>;
}

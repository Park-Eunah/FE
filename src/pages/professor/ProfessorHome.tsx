import { ArrowRight, BookOpen, Check, ChevronRight, Clock, Flag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Banner, Button, Card, DataTable, IndexChip, ListRow, PageHeader, ProgressRing, StatCard } from "../../components";
import { ProfessorLayout } from "../../components/layout/ProfessorSidebar";
import { linkButton } from "../../components/ui/classes";
import { COURSES, GRADING_TASKS, type GradingTask } from "./mockHome";

const ICON = { size: 28, strokeWidth: 1.75 } as const;
const statLink = "block rounded-2xl text-inherit no-underline focus-visible:shadow-ring focus-visible:outline-none [&>div]:transition-colors hover:[&>div]:border-border-strong";

export function ProfessorHome() {
  const navigate = useNavigate();
  const flagTotal = GRADING_TASKS.reduce((sum, task) => sum + task.flags, 0);

  return (
    <ProfessorLayout>
      <PageHeader
        eyebrow="2025년 봄학기" title="안녕하세요, 박서연 교수님"
        description="수업과 과제 운영 현황을 확인하고 필요한 업무를 이어가세요."
        actions={<Button variant="secondary" onClick={() => navigate("/professor/classes")}>수업 관리<ChevronRight size={18} strokeWidth={1.75} /></Button>}
      />

      <div className="grid grid-cols-3 gap-4">
        <Link to="/professor/classes" className={statLink}><StatCard icon={<BookOpen {...ICON} />} label="진행 중인 수업" value={2} sub="전체 수업 3개" /></Link>
        <Link to="/professor/review" className={statLink}><StatCard tone="orange" icon={<Flag {...ICON} />} label="검토 대기" value={7} sub="FLAG 확인 필요" /></Link>
        <Link to="/professor/problems" className={statLink}><StatCard tone="green" icon={<Check {...ICON} />} label="평균 제출률" value="82%" sub="진행 과제 기준" /></Link>
      </div>

      <Card
        padding="table" title="수업 현황" subtitle="담당 수업의 수강생과 과제 제출률을 확인하세요."
        action={<button type="button" className={linkButton} onClick={() => navigate("/professor/classes")}>전체 수업<ArrowRight size={18} strokeWidth={1.75} /></button>}
      >
        {COURSES.map((course, index) => (
          <ListRow
            key={course.code}
            leading={<IndexChip tone={course.tone}>{course.code}</IndexChip>}
            title={course.title} subtitle={course.term}
            onClick={() => navigate(`/professor/classes?class=${index}`)}
            trailing={
              <>
                <span className="w-24"><small className="block text-sm leading-5 text-fg-secondary">수강생</small><b className="text-base leading-6">{course.students}명</b></span>
                <span className="w-28"><small className="block text-sm leading-5 text-fg-secondary">진행 중 과제</small><b className="text-base leading-6">{course.activeProblems ? `${course.activeProblems}개` : "없음"}</b></span>
                <span className="flex items-center gap-3"><small className="text-sm leading-5 text-fg-secondary">제출률</small><ProgressRing percent={course.rate} /></span>
              </>
            }
          />
        ))}
      </Card>

      <Card
        padding="table" title="채점 현황" subtitle="마감 전에 아직 점수가 공개되지 않은 과제 기준입니다."
        action={
          <div className="flex items-center gap-5">
            <Badge tone="flag">FLAG 검토 {flagTotal}건</Badge>
            <button type="button" className={linkButton} onClick={() => navigate("/professor/review")}>채점 검토<ArrowRight size={18} strokeWidth={1.75} /></button>
          </div>
        }
      >
        <DataTable<GradingTask>
          rows={GRADING_TASKS} rowKey={(task) => task.title} onRowClick={() => navigate("/professor/review")}
          columns={[
            { key: "title", header: "과제", render: (task) => <><strong className="block text-fg">{task.title}</strong><small className="text-sm text-fg-secondary">{task.course}</small></> },
            { key: "due", header: "마감", render: (task) => <Badge tone="flag">D-{task.dueInDays}</Badge> },
            { key: "submitted", header: "제출", render: (task) => <><strong className="text-fg">{task.submitted}</strong><span className="text-fg-secondary"> / {task.total}</span></> },
            { key: "graded", header: "채점 완료", render: (task) => <strong className="text-success-fg">{task.graded}건</strong> },
            { key: "grading", header: "채점 중", render: (task) => <Badge tone="info">{task.grading}건</Badge> },
            { key: "flags", header: "FLAG", render: (task) => <Badge tone="flag">{task.flags}건</Badge> },
          ]}
        />
        <div className="px-[30px] py-5"><Banner type="info" icon={<Clock size={22} strokeWidth={1.75} />}>점수 공개 후에는 이 현황에서 제외되며 점수 공개 화면에서 확인할 수 있습니다.</Banner></div>
      </Card>
    </ProfessorLayout>
  );
}

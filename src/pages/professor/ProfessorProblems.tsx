import { useMemo, useState } from "react";
import { Check, Clock, Flag, Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Badge, Button, Card, DataTable, EmptyState, IndexChip, PageHeader, Pagination, StatCard } from "../../components";
import { ProfessorLayout } from "../../components/layout/ProfessorSidebar";
import { usePagination } from "./usePagination";
import { ClassAssignmentDetails } from "./ClassAssignmentDetails";
import { getAssignmentStatus, readProfessorAssignments, useAssignmentClock, type AssignmentView } from "./professorAssignments";

const STATUS_TONE = { 공개: "success", 예약: "info", 종료: "neutral" } as const;
const SETTINGS = [
  { label: "문제", section: "problem" },
  { label: "케이스", section: "cases" },
  { label: "정책", section: "policy" },
] as const;
const ICON = { size: 28, strokeWidth: 1.75 } as const;

export function ProfessorProblems() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const detailKey = searchParams.get("assignment");
  const [assignments] = useState(readProfessorAssignments);
  const now = useAssignmentClock(assignments);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => assignments
    .filter((item) => item.title.toLowerCase().includes(query.trim().toLowerCase()))
    .map((item) => ({ ...item, status: getAssignmentStatus(item, now) })), [assignments, query, now]);
  const pager = usePagination(filtered, 5, query, true);
  const detail = detailKey ? assignments.find((item) => item.editKey === detailKey) : undefined;

  const openAssignment = (item: AssignmentView) => {
    if (!item.editKey) return;
    const params = { assignment: item.editKey };
    if (item.status === "공개") navigate(`/professor/review?${new URLSearchParams(params)}`);
    else setSearchParams(params);
  };

  return (
    <ProfessorLayout onSearch={setQuery} searchPlaceholder="과제 검색">
      {detailKey ? (
        <ClassAssignmentDetails assignment={detail && { ...detail, status: getAssignmentStatus(detail, now) }} listPath="/professor/problems" />
      ) : (
        <>
          <PageHeader
            eyebrow="PROFESSOR · PROBLEMS" title="문제 관리" description="과제를 만들고 학생 제출 및 채점 현황을 관리하세요."
            actions={<Button icon={<Plus size={20} strokeWidth={1.75} />} onClick={() => navigate("/professor/problems/new")}>새 문제 등록</Button>}
          />

          <div className="grid grid-cols-3 gap-4">
            <StatCard tone="green" icon={<Check {...ICON} />} label="제출 완료" value={286} sub="전체 과제 누적" />
            <StatCard tone="orange" icon={<Flag {...ICON} />} label="검토 대기" value={7} sub="FLAG 제출 7건" />
            <StatCard icon={<Clock {...ICON} />} label="채점 중" value={12} sub="평균 4.2초 소요" />
          </div>

          <Card padding="table" title="과제 목록" subtitle="마감과 제출 현황을 한눈에 확인하세요.">
            <DataTable<AssignmentView>
              rows={pager.items} rowKey={(item) => item.id} onRowClick={openAssignment}
              empty={<EmptyState title="검색한 과제가 없어요" description="다른 이름으로 검색해 보세요." />}
              columns={[
                {
                  key: "title", header: "과제",
                  render: (item) => (
                    <span className="flex items-center gap-4">
                      <IndexChip>{String(item.id).padStart(2, "0")}</IndexChip>
                      <strong className="text-[17px] leading-6 text-fg">{item.title}</strong>
                    </span>
                  ),
                },
                { key: "due", header: "마감" },
                { key: "submitted", header: "제출 수", render: (item) => <strong className="text-fg">{item.submitted} / {item.total}</strong> },
                { key: "flags", header: "FLAG", render: (item) => <Badge tone={item.flags === 0 ? "neutral" : "flag"}>{item.flags}</Badge> },
                { key: "status", header: "상태", render: (item) => <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge> },
                {
                  key: "settings", header: "설정",
                  render: (item) => (
                    <span className="flex gap-2">
                      {SETTINGS.map(({ label, section }) => (
                        <Button
                          key={section} variant="secondary" size="sm" disabled={!item.editKey} aria-label={`${item.title} ${label} 수정`}
                          onClick={(event) => { event.stopPropagation(); navigate(`/professor/problems/${item.editKey}/edit?section=${section}`); }}
                        >{label}</Button>
                      ))}
                    </span>
                  ),
                },
              ]}
            />
            {pager.show && <Pagination page={pager.page} pageCount={pager.pageCount} onChange={pager.setPage} summary={pager.summary} />}
          </Card>
        </>
      )}
    </ProfessorLayout>
  );
}

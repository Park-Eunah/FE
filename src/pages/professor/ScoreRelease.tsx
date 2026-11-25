import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge, Banner, Button, Card, ConfirmModal, DataTable, DateTimePicker, PageHeader, Pagination, RadioGroup, useToast,
} from "../../components";
import { ProfessorLayout } from "../../components/layout/ProfessorSidebar";
import { RELEASE_TASKS } from "./mockScoreRelease";
import { usePagination } from "./usePagination";

export function ScoreRelease() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tasks, setTasks] = useState(RELEASE_TASKS);
  const [selectedId, setSelectedId] = useState(1);
  const [mode, setMode] = useState<"now" | "scheduled">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pager = usePagination(tasks, 5, "", true);
  const selected = tasks.find((task) => task.id === selectedId) ?? tasks[0];

  const releaseNow = () => {
    setTasks((items) => items.map((item) => item.id === selectedId ? { ...item, released: true, pending: 0, scheduledAt: undefined } : item));
    setConfirmOpen(false);
    toast("success", `${selected.title} 점수를 공개했어요.`);
  };
  const release = () => {
    if (mode === "now") { setConfirmOpen(true); return; }
    if (!scheduledAt) { toast("error", "점수를 공개할 날짜와 시간을 선택해주세요."); return; }
    setTasks((items) => items.map((item) => item.id === selectedId ? { ...item, scheduledAt } : item));
    toast("success", `${new Date(scheduledAt).toLocaleString("ko-KR")}에 공개하도록 예약했어요.`);
  };

  return (
    <ProfessorLayout>
      <PageHeader eyebrow="PROFESSOR · SCORE RELEASE" title="점수 공개" description="과제별 확정 상태를 확인하고 학생에게 점수를 공개하세요." />
      <div className="grid grid-cols-[minmax(0,1fr)_480px] items-start gap-7">
        <Card title="과제별 공개 현황" subtitle="과제를 선택해 공개 방식을 설정하세요." padding="table">
          <DataTable
            rows={pager.items} rowKey={(task) => task.id} selectedKey={selectedId} onRowClick={(task) => setSelectedId(task.id)}
            columns={[
              { key: "title", header: "과제", render: (task) => (<><strong className="block">{task.title}</strong><span className="text-sm text-fg-secondary">{task.course}</span></>) },
              { key: "submitted", header: "제출 수", render: (task) => `${task.submitted} / ${task.total}` },
              { key: "pending", header: "미확정", render: (task) => <Badge tone={task.pending === 0 ? "neutral" : "flag"}>{task.pending}건</Badge> },
              { key: "status", header: "공개 상태", render: (task) => task.released ? <Badge tone="success">공개 완료</Badge> : task.scheduledAt ? <Badge tone="info">공개 예정</Badge> : <Badge tone="neutral">공개 전</Badge> },
            ]}
          />
          {pager.show && <Pagination page={pager.page} pageCount={pager.pageCount} onChange={pager.setPage} summary={pager.summary} />}
        </Card>

        <Card
          title={selected.title} subtitle={`${selected.course} · 제출 ${selected.submitted} / ${selected.total} · 미확정 ${selected.pending}건`}
          action={selected.released ? <Badge tone="success">공개 완료</Badge> : <Badge tone="neutral">공개 전</Badge>}
        >
          <h3 className="m-0 mb-3 text-base leading-6 font-bold">공개 방식</h3>
          <RadioGroup
            name="release-mode" value={mode} onChange={setMode}
            options={[
              { value: "now", label: "지금 바로 공개 — 확인 즉시 모든 학생에게 공개해요.", disabled: selected.released },
              { value: "scheduled", label: "예약 공개 — 지정한 날짜와 시간에 자동으로 공개해요.", disabled: selected.released },
            ]}
          />
          {mode === "scheduled" && !selected.released && (
            <div className="mt-2 max-w-[360px]"><DateTimePicker label="공개 날짜 및 시간" value={scheduledAt} onChange={setScheduledAt} /></div>
          )}
          {selected.pending > 0 && (
            <div className="mt-5">
              <Banner type="warning" title="미확정 제출이 있어요">
                미확정 {selected.pending}건은 공개 시점에 자동 채점 점수로 일괄 확정돼요. FLAG 검토 중인 제출도 포함돼요.
              </Banner>
            </div>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => navigate("/professor/review")}>미확정 검토하기</Button>
            <Button disabled={selected.released} onClick={release}>{selected.released ? "공개 완료" : mode === "now" ? "점수 공개" : "공개 예약"}</Button>
          </div>
        </Card>
      </div>
      <ConfirmModal
        open={confirmOpen} title="점수를 지금 공개할까요?"
        description={`${selected.title} 점수가 모든 학생에게 바로 공개돼요.\n미확정 제출은 자동 채점 점수로 확정됩니다.`}
        confirmLabel="점수 공개" onConfirm={releaseNow} onCancel={() => setConfirmOpen(false)}
      />
    </ProfessorLayout>
  );
}

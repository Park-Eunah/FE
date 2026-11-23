import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { readEditableProblem, type AssignmentView } from "./professorAssignments";
import { ClassAssignmentSubmissions } from "./ClassAssignmentSubmissions";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" });

function formatDate(value?: string) {
  const time = Date.parse(value ?? "");
  return Number.isFinite(time) ? dateFormatter.format(time) : "미설정";
}

export function ClassAssignmentDetails({ assignment, listPath }: { assignment?: AssignmentView; listPath: string }) {
  let problem;
  try {
    problem = assignment?.editKey ? readEditableProblem(assignment.editKey)?.problem : undefined;
  } catch {
    problem = undefined;
  }

  return (
    <div className="grid gap-5 p-4 sm:p-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="m-0 text-sm text-fg-secondary">과제 상세</p>
          <h2 className="my-1 text-xl text-fg">{problem?.title ?? "과제를 찾을 수 없어요."}</h2>
        </div>
        <Link to={listPath} className="secondary-button no-underline">
          <ArrowLeft size={16} aria-hidden /> 과제 목록
        </Link>
      </div>
      {problem && assignment && (
        <>
          <section className="rounded-xl border border-solid border-border p-4">
            <h3 className="mt-0 mb-3 text-base">문제 설명</h3>
            <p className="m-0 whitespace-pre-wrap [overflow-wrap:anywhere]">{problem.description || "등록된 설명이 없어요."}</p>
            <dl className="mb-0 grid gap-4 sm:grid-cols-2">
              {[
                { label: "입력 형식", value: problem.inputFormat },
                { label: "출력 형식", value: problem.outputFormat },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-bg p-3">
                  <dt className="font-semibold">{label}</dt>
                  <dd className="mt-1 ml-0 whitespace-pre-wrap text-fg-secondary [overflow-wrap:anywhere]">{value || "미입력"}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-xl border border-solid border-border p-4">
            <h3 className="mt-0 mb-3 text-base">실행 조건 및 제출 정책</h3>
            <dl className="m-0 grid grid-cols-2 gap-4 lg:grid-cols-3">
              {[
                { label: "시간 제한", value: problem.timeLimit ? `${problem.timeLimit}초` : "미설정" },
                { label: "메모리 제한", value: problem.memoryLimit ? `${problem.memoryLimit} MB` : "미설정" },
                { label: "제출 마감", value: formatDate(problem.deadline) },
                { label: "재제출", value: problem.resubmission ? "허용" : "허용 안 함" },
                { label: "화면 이탈 기록", value: problem.trackLeave ? "사용" : "사용 안 함" },
                { label: "문제 상태", value: assignment.status },
                ...(problem.status === "초안"
                  ? [{ label: "공개 설정", value: "초안 저장됨" }]
                  : problem.publishAt ? [{ label: "설정된 공개 일시", value: formatDate(problem.publishAt) }] : []),
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-sm text-fg-secondary">{label}</dt>
                  <dd className="mt-1 ml-0 font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-xl border border-solid border-border p-4">
            <h3 className="mt-0 mb-3 text-base">테스트케이스</h3>
            {problem.testCases?.length ? (
              <ul className="m-0 grid list-none gap-3 p-0">
                {problem.testCases.map((testCase, index) => (
                  <li key={testCase.id} className="rounded-lg border border-solid border-border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <b>케이스 {index + 1}</b>
                      <span className="text-sm text-fg-secondary">{testCase.visibility === "public" ? "공개" : "비공개"}</span>
                    </div>
                    <dl className="mb-0 grid min-w-0 gap-3 sm:grid-cols-2">
                      <div className="min-w-0"><dt>입력값</dt><dd className="mt-1 ml-0 overflow-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]">{testCase.input || "—"}</dd></div>
                      <div className="min-w-0"><dt>기대 출력값</dt><dd className="mt-1 ml-0 overflow-auto whitespace-pre-wrap font-mono [overflow-wrap:anywhere]">{testCase.expectedOutput || "—"}</dd></div>
                    </dl>
                  </li>
                ))}
              </ul>
            ) : <p className="m-0 text-fg-secondary">등록된 테스트케이스가 없어요.</p>}
          </section>
          {assignment.status !== "예약" && <ClassAssignmentSubmissions key={assignment.editKey} assignment={assignment} />}
        </>
      )}
    </div>
  );
}

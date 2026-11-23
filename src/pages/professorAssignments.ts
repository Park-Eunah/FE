import { useEffect, useState } from "react";
import { readProfessorClasses } from "./professorClassData";
import { readSavedProblems, type ProblemStatus, type SavedProblem } from "./savedProblems";

export type AssignmentState = "예약" | "공개" | "종료";

export type Assignment = {
  id: number;
  editKey?: string;
  classId?: string;
  title: string;
  due: string;
  deadline?: string;
  submitted: number;
  total: number;
  flags: number;
  status: ProblemStatus;
  publishAt?: string;
};

export type AssignmentView = Omit<Assignment, "status"> & { status: AssignmentState };

const initialAssignments: Assignment[] = [
  { id: 1, classId: "algorithms", title: "두 수의 합", due: "5월 18일 · 마감", submitted: 48, total: 52, flags: 4, status: "공개" },
  { id: 2, classId: "data-structures", title: "괄호 문자열 검사", due: "5월 28일", submitted: 43, total: 60, flags: 3, status: "공개" },
  { id: 3, classId: "algorithms", title: "최단 경로 찾기", due: "5월 31일", submitted: 38, total: 52, flags: 2, status: "공개" },
  { id: 4, classId: "data-structures", title: "우선순위 큐 구현", due: "6월 4일", submitted: 33, total: 60, flags: 0, status: "초안" },
];

const sampleProblemDetails: Record<number, { description: string; deadline: string }> = {
  1: { description: "입력으로 주어진 두 정수의 합을 출력하세요.", deadline: "2025-05-18T23:59" },
  2: { description: "주어진 문자열의 괄호가 올바르게 짝지어져 있는지 검사하세요.", deadline: "2025-05-28T23:59" },
  3: { description: "그래프에서 출발 정점부터 각 정점까지의 최단 거리를 구하세요.", deadline: "2025-05-31T23:59" },
  4: { description: "우선순위에 따라 원소를 삽입하고 꺼내는 큐를 구현하세요.", deadline: "2025-06-04T23:59" },
};

export function readEditableProblem(key: string): { problem: SavedProblem; index?: number } | undefined {
  const saved = readSavedProblems();
  if (key.startsWith("saved-")) {
    const index = saved.findIndex((problem, index) => !problem.sampleId && key === `saved-${index}`);
    return index >= 0 ? { problem: saved[index], index } : undefined;
  }
  const sample = initialAssignments.find((item) => key === `sample-${item.id}`);
  if (!sample) return undefined;
  const index = saved.findIndex((problem) => problem.sampleId === sample.id);
  if (index >= 0) return { problem: saved[index], index };

  return {
    problem: {
      sampleId: sample.id, classId: sample.classId, title: sample.title,
      ...sampleProblemDetails[sample.id], inputFormat: "", outputFormat: "",
      timeLimit: "1", memoryLimit: "128", resubmission: true, trackLeave: false,
      status: sample.status, testCases: [],
    },
  };
}

export function readProfessorAssignments(): Assignment[] {
  const samples = initialAssignments.map((item) => ({ ...item, editKey: `sample-${item.id}`, deadline: sampleProblemDetails[item.id].deadline }));
  try {
    const classes = readProfessorClasses();
    const saved = readSavedProblems();
    const fromProblem = (problem: SavedProblem) => ({
      classId: problem.classId,
      title: problem.title,
      due: problem.deadline.replace("T", " ") || "마감일 미설정",
      deadline: problem.deadline,
      status: problem.status,
      publishAt: problem.publishAt,
    });
    const updatedSamples = samples.map((item) => {
      const edited = saved.find((problem) => problem.sampleId === item.id);
      if (!edited) return item;
      const fields = fromProblem(edited);
      return { ...item, ...fields, due: edited.deadline === sampleProblemDetails[item.id].deadline ? item.due : fields.due };
    });
    const registered = saved.flatMap((problem, index): Assignment[] => problem.sampleId ? [] : [{
      id: initialAssignments.length + index + 1,
      editKey: `saved-${index}`,
      ...fromProblem(problem),
      submitted: 0,
      total: classes.find((course) => course.id === problem.classId)?.count ?? 60,
      flags: 0,
    }]);
    return [...updatedSamples, ...registered];
  } catch {
    return samples;
  }
}

export function getAssignmentStatus(assignment: Assignment, now: number): AssignmentState {
  const publishAt = Date.parse(assignment.publishAt ?? "");
  if (assignment.status === "초안" || (assignment.status === "공개 예약" && !(publishAt <= now))) return "예약";
  return Date.parse(assignment.deadline ?? "") <= now ? "종료" : "공개";
}

export function useAssignmentClock(assignments: Assignment[]) {
  const [now, setNow] = useState(Date.now);
  const nextChangeAt = assignments.reduce((next, assignment) => {
    const status = getAssignmentStatus(assignment, now);
    const date = status === "공개" ? assignment.deadline : assignment.status === "공개 예약" && status === "예약" ? assignment.publishAt : undefined;
    const time = Date.parse(date ?? "");
    return time > now ? Math.min(next, time) : next;
  }, Infinity);

  useEffect(() => {
    if (!Number.isFinite(nextChangeAt)) return;
    const timeout = window.setTimeout(() => setNow(Date.now()), Math.min(Math.max(nextChangeAt - Date.now(), 0), 2_147_483_647));
    return () => window.clearTimeout(timeout);
  }, [nextChangeAt, now]);

  return now;
}

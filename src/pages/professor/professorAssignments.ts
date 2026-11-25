import { useEffect, useState } from "react";
import { ASSIGNMENTS, PROBLEM_DETAILS } from "./mockAssignments";
import { readProfessorClasses } from "./professorClassData";
import type { Assignment } from "./mockAssignments";
import { readSavedProblems, type SavedProblem } from "./savedProblems";

export type { Assignment };

export type AssignmentState = "예약" | "공개" | "종료";

export type AssignmentView = Omit<Assignment, "status"> & { status: AssignmentState };

export function readEditableProblem(key: string): { problem: SavedProblem; index?: number } | undefined {
  const saved = readSavedProblems();
  if (key.startsWith("saved-")) {
    const index = saved.findIndex((problem, index) => !problem.sampleId && key === `saved-${index}`);
    return index >= 0 ? { problem: saved[index], index } : undefined;
  }
  const sample = ASSIGNMENTS.find((item) => key === `sample-${item.id}`);
  if (!sample) return undefined;
  const index = saved.findIndex((problem) => problem.sampleId === sample.id);
  if (index >= 0) return { problem: saved[index], index };

  return {
    problem: {
      sampleId: sample.id, classId: sample.classId, title: sample.title,
      ...PROBLEM_DETAILS[sample.id], resubmission: true, trackLeave: false,
      status: sample.status,
    },
  };
}

export function readProfessorAssignments(): Assignment[] {
  const samples = ASSIGNMENTS.map((item) => ({ ...item, editKey: `sample-${item.id}`, deadline: PROBLEM_DETAILS[item.id].deadline }));
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
      return { ...item, ...fields, due: edited.deadline === PROBLEM_DETAILS[item.id].deadline ? item.due : fields.due };
    });
    const registered = saved.flatMap((problem, index): Assignment[] => problem.sampleId ? [] : [{
      id: ASSIGNMENTS.length + index + 1,
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

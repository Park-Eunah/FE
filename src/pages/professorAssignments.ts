import { readProfessorClasses } from "./professorClassData";
import { readSavedProblems } from "./savedProblems";

export type Assignment = {
  id: number;
  classId?: string;
  title: string;
  due: string;
  submitted: number;
  total: number;
  flags: number;
  status: "공개" | "초안";
};

const initialAssignments: Assignment[] = [
  { id: 1, classId: "algorithms", title: "두 수의 합", due: "5월 18일 · 마감", submitted: 48, total: 52, flags: 4, status: "공개" },
  { id: 2, classId: "data-structures", title: "괄호 문자열 검사", due: "5월 28일", submitted: 43, total: 60, flags: 3, status: "공개" },
  { id: 3, classId: "algorithms", title: "최단 경로 찾기", due: "5월 31일", submitted: 38, total: 52, flags: 2, status: "공개" },
  { id: 4, classId: "data-structures", title: "우선순위 큐 구현", due: "6월 4일", submitted: 33, total: 60, flags: 0, status: "초안" },
];
export function readProfessorAssignments(): Assignment[] {
  try {
    const classes = readProfessorClasses();
    const saved = readSavedProblems().map((problem, index): Assignment => ({
      id: initialAssignments.length + index + 1,
      classId: problem.classId,
      title: problem.title,
      due: problem.deadline.replace("T", " ") || "마감일 미설정",
      submitted: 0,
      total: classes.find((course) => course.id === problem.classId)?.count ?? 60,
      flags: 0,
      status: problem.status,
    }));
    return [...initialAssignments, ...saved];
  } catch {
    return initialAssignments;
  }
}

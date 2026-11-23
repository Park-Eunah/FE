export type ClassInfo = { id: string; title: string; term: string; count: number; code: string; open: boolean };

const initialClasses: ClassInfo[] = [
  { id: "data-structures", title: "자료구조", term: "2025년 봄학기", count: 60, code: "DS-7K92-QX", open: true },
  { id: "algorithms", title: "알고리즘", term: "2025년 봄학기", count: 52, code: "AL-4P18-MN", open: true },
  { id: "python", title: "Python 프로그래밍", term: "2024년 가을학기", count: 48, code: "PY-9C31-LK", open: false },
];
const storageKey = "autota.professor.classes";
const studentNames = ["김민준", "최준서", "조채원", "임도윤", "박수빈", "강서현", "장예린", "이건우", "정다은", "한유진"];
const departments = ["컴퓨터공학과", "소프트웨어학과", "인공지능학과", "정보통신공학과"];

export function getMockClassStudent(classId: string, index: number) {
  const classIndex = Math.max(0, initialClasses.findIndex((course) => course.id === classId));
  const rosterIndex = classIndex * 63 + index;
  return {
    name: studentNames[rosterIndex % studentNames.length],
    department: departments[rosterIndex % departments.length],
    studentId: `20251${String(rosterIndex + 1).padStart(3, "0")}`,
  };
}

export function readProfessorClasses(): ClassInfo[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "null");
    return Array.isArray(stored) ? stored : initialClasses;
  } catch {
    return initialClasses;
  }
}

export function saveProfessorClasses(classes: ClassInfo[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(classes));
}

export type ClassInfo = { id: string; title: string; term: string; count: number; code: string; open: boolean };

const initialClasses: ClassInfo[] = [
  { id: "data-structures", title: "자료구조", term: "2025년 봄학기", count: 60, code: "DS-7K92-QX", open: true },
  { id: "algorithms", title: "알고리즘", term: "2025년 봄학기", count: 52, code: "AL-4P18-MN", open: true },
  { id: "python", title: "Python 프로그래밍", term: "2024년 가을학기", count: 48, code: "PY-9C31-LK", open: false },
];
const storageKey = "autota.professor.classes";

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

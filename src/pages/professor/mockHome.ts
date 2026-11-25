export type Course = { title: string; term: string; code: string; students: number; activeProblems: number; rate: number; tone: "blue" | "purple" | "neutral" };

/* TODO: 홈 요약 API 연결 후 서버 응답으로 교체 */
export const COURSES: Course[] = [
  { title: "자료구조", term: "2025년 봄학기", code: "DS", students: 60, activeProblems: 4, rate: 80, tone: "blue" },
  { title: "알고리즘", term: "2025년 봄학기", code: "AL", students: 52, activeProblems: 3, rate: 86, tone: "purple" },
  { title: "Python 프로그래밍", term: "2024년 가을학기", code: "PY", students: 48, activeProblems: 0, rate: 100, tone: "neutral" },
];

export type GradingTask = { title: string; course: string; dueInDays: number; submitted: number; total: number; graded: number; grading: number; flags: number };

/* TODO: 채점 현황 API 연결 후 서버 응답으로 교체 */
export const GRADING_TASKS: GradingTask[] = [
  { title: "괄호 문자열 검사", course: "자료구조", dueInDays: 7, submitted: 43, total: 60, graded: 39, grading: 4, flags: 3 },
  { title: "프로세스 스케줄링", course: "운영체제", dueInDays: 8, submitted: 31, total: 45, graded: 29, grading: 2, flags: 2 },
  { title: "최단 경로 찾기", course: "알고리즘", dueInDays: 10, submitted: 38, total: 52, graded: 36, grading: 2, flags: 2 },
  { title: "SQL 조인 쿼리", course: "데이터베이스", dueInDays: 12, submitted: 29, total: 55, graded: 29, grading: 0, flags: 3 },
];

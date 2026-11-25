export type ReleaseTask = {
  id: number;
  title: string;
  course: string;
  submitted: number;
  total: number;
  /** 아직 교수가 확정하지 않은 제출 수 */
  pending: number;
  released: boolean;
  scheduledAt?: string;
};

/* TODO: 점수 공개 현황 API 연결 후 서버 응답으로 교체 */
export const RELEASE_TASKS: ReleaseTask[] = [
  { id: 1, title: "괄호 문자열 검사", course: "자료구조", submitted: 48, total: 60, pending: 7, released: false },
  { id: 2, title: "두 수의 합", course: "알고리즘", submitted: 50, total: 52, pending: 0, released: true },
  { id: 3, title: "최단 경로 찾기", course: "알고리즘", submitted: 44, total: 52, pending: 3, released: false },
  { id: 4, title: "스택 수열", course: "자료구조", submitted: 57, total: 60, pending: 1, released: false },
  { id: 5, title: "프로세스 스케줄링", course: "운영체제", submitted: 31, total: 45, pending: 4, released: false },
  { id: 6, title: "SQL 조인 쿼리", course: "데이터베이스", submitted: 29, total: 55, pending: 5, released: false },
  { id: 7, title: "소켓 통신 구현", course: "컴퓨터네트워크", submitted: 38, total: 40, pending: 0, released: true },
  { id: 8, title: "리스트 컴프리헨션", course: "Python 프로그래밍", submitted: 47, total: 48, pending: 1, released: false },
];

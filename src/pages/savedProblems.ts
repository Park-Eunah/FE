export type TestCase = {
  id: number;
  input: string;
  expectedOutput: string;
  visibility: "public" | "private";
};

type SavedProblem = {
  classId?: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  timeLimit: string;
  memoryLimit: string;
  deadline: string;
  resubmission: boolean;
  trackLeave: boolean;
  status: "공개" | "초안";
  testCases: TestCase[];
};

const storageKey = "autota.professor.problems";

export function readSavedProblems(): SavedProblem[] {
  return JSON.parse(window.localStorage.getItem(storageKey) ?? "[]");
}

export function saveProblem(problem: SavedProblem) {
  const problems = readSavedProblems();
  window.localStorage.setItem(storageKey, JSON.stringify([...problems, problem]));
}

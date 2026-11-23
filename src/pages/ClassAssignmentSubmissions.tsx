import { useState } from "react";
import type { AssignmentView } from "./professorAssignments";
import { getMockClassStudent } from "./professorClassData";

const sampleAnswers: Record<string, [string, string]> = {
  "sample-1": ["a, b = map(int, input().split())\nprint(a + b)", "values = list(map(int, input().split()))\nprint(sum(values))"],
  "sample-2": [
    "balance = 0\nfor char in input():\n    balance += 1 if char == '(' else -1\n    if balance < 0:\n        break\nprint('YES' if balance == 0 else 'NO')",
    "stack = []\nvalid = True\nfor char in input():\n    if char == '(':\n        stack.append(char)\n    elif stack:\n        stack.pop()\n    else:\n        valid = False\n        break\nprint('YES' if valid and not stack else 'NO')",
  ],
  "sample-3": [
    "from heapq import heappop, heappush\n\ndef shortest_paths(graph, start):\n    distances = {start: 0}\n    queue = [(0, start)]\n    while queue:\n        distance, node = heappop(queue)\n        if distances[node] != distance:\n            continue\n        for neighbor, weight in graph[node]:\n            candidate = distance + weight\n            if candidate < distances.get(neighbor, float('inf')):\n                distances[neighbor] = candidate\n                heappush(queue, (candidate, neighbor))\n    return distances",
    "def shortest_paths(graph, start):\n    distances = {start: 0}\n    for _ in graph:\n        for node, edges in graph.items():\n            for neighbor, weight in edges:\n                candidate = distances.get(node, float('inf')) + weight\n                if candidate < distances.get(neighbor, float('inf')):\n                    distances[neighbor] = candidate\n    return distances",
  ],
  "sample-4": [
    "from heapq import heappop, heappush\n\nqueue = []\n\ndef push(priority, value):\n    heappush(queue, (priority, value))\n\ndef pop():\n    return heappop(queue)[1]",
    "queue = []\n\ndef push(priority, value):\n    queue.append((priority, value))\n\ndef pop():\n    item = min(queue)\n    queue.remove(item)\n    return item[1]",
  ],
};

export function ClassAssignmentSubmissions({ assignment }: { assignment: AssignmentView }) {
  const [selectedId, setSelectedId] = useState<string>();
  const answers = assignment.editKey ? sampleAnswers[assignment.editKey] : undefined;
  const classId = assignment.classId;
  const submissions = answers && classId ? Array.from({ length: assignment.submitted }, (_, index) => ({
    ...getMockClassStudent(classId, index),
    answer: answers[index % answers.length],
    finalScore: [100, 85, 90, 75][index % 4],
  })) : [];
  const selected = submissions.find((item) => item.studentId === selectedId);
  const ended = assignment.status === "종료";

  return (
    <section className="rounded-xl border border-solid border-border p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="m-0 text-base">제출 현황</h3>
        <span className="text-sm text-fg-secondary">{submissions.length} / {assignment.total}명 제출</span>
      </div>
      {submissions.length === 0 ? (
        <p className="m-0 text-sm text-fg-secondary">아직 제출한 학생이 없어요.</p>
      ) : (
        <>
          <p className="mt-0 text-sm text-fg-secondary">샘플 제출 데이터입니다.</p>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <ul aria-label="제출한 학생" className="m-0 max-h-80 list-none overflow-auto rounded-lg border border-solid border-border p-0">
              {submissions.map((item) => (
                <li key={item.studentId} className="border-0 border-b border-solid border-border last:border-b-0">
                  <button type="button" aria-pressed={selectedId === item.studentId} onClick={() => setSelectedId(item.studentId)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-2 border-0 px-3 py-2 text-left text-fg hover:bg-info-bg ${selectedId === item.studentId ? "bg-info-bg" : "bg-surface"}`}>
                    <span><b>{item.name}</b><small className="ml-2 text-fg-secondary">{item.studentId}</small></span>
                    {ended && <span className="shrink-0 text-sm font-semibold">최종 {item.finalScore}점</span>}
                  </button>
                </li>
              ))}
            </ul>
            <div className="min-w-0 rounded-lg bg-bg p-3">
              {selected ? (
                <>
                  <h4 className="mt-0 mb-2">{selected.name} 제출 답안</h4>
                  {ended && <p className="mt-0 mb-2 text-sm font-semibold">최종 점수 {selected.finalScore}점</p>}
                  <pre className="m-0 max-h-72 overflow-auto rounded-md bg-surface p-3 font-mono text-sm"><code>{selected.answer}</code></pre>
                </>
              ) : <p className="m-0 text-sm text-fg-secondary">학생을 선택하면 제출 답안을 확인할 수 있어요.</p>}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

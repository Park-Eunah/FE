import "@fontsource/noto-sans-kr/400.css";
import "@fontsource/noto-sans-kr/500.css";
import "@fontsource/noto-sans-kr/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "./styles/tailwind.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components";
import { ComponentGallery } from "./pages/ComponentGallery";
import { Showcase } from "./Showcase";
import { ProfessorClasses } from "./pages/ProfessorClasses";
import { ProfessorProblems } from "./pages/ProfessorProblems";
import { ProblemEditor } from "./pages/ProblemEditor";
import { GradingReview } from "./pages/GradingReview";
import { ScoreRelease } from "./pages/ScoreRelease";
import { ProfessorHome } from "./pages/ProfessorHome";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ToastProvider>
      <Routes>
        <Route path="/" element={<ProfessorHome />} />
        <Route path="/classes" element={<ProfessorClasses />} />
        <Route path="/problems" element={<ProfessorProblems />} />
        <Route path="/problems/new" element={<ProblemEditor />} />
        <Route path="/problems/:problemKey/edit" element={<ProblemEditor />} />
        <Route path="/review" element={<GradingReview />} />
        <Route path="/scores" element={<ScoreRelease />} />
        <Route path="/components" element={<ComponentGallery />} />
        {/* 서비스 화면 예시(나중에 정식 화면으로 교체) */}
        <Route path="/showcase" element={<Showcase />} />
        {/* 그 외 주소(/ 또는 오타)는 갤러리로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  </BrowserRouter>
);

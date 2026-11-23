import { useId, useState, type ReactNode } from "react";
import { BookOpen, FileText, Flag, Home, LogOut, PanelLeftClose, PanelLeftOpen, ShieldCheck, Users } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import "./ProfessorSidebar.css";

const menu = [
  { path: "/", label: "홈", icon: Home },
  { path: "/classes", label: "수업 관리", icon: Users },
  { path: "/problems", label: "문제 관리", icon: BookOpen },
  { path: "/review", label: "채점 검토", icon: Flag },
  { path: "/scores", label: "점수 공개", icon: FileText },
];

interface ProfessorLayoutProps {
  onNotify: (message: string) => void;
  pendingCount?: number;
  children: ReactNode;
}

const collapsedStorageKey = "autota.professorSidebarCollapsed";

export function ProfessorLayout({ onNotify, pendingCount = 7, children }: ProfessorLayoutProps) {
  const contentId = useId();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(collapsedStorageKey) === "true";
    } catch {
      return false;
    }
  });
  const toggleSidebar = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(collapsedStorageKey, String(next));
    } catch {
      // Storage can be unavailable in restricted browsers.
    }
  };
  const toggleLabel = collapsed ? "사이드바 열기" : "사이드바 접기";
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <div className="professor-app" data-sidebar-collapsed={collapsed}>
      <aside className="professor-sidebar" aria-label="교수 사이드바">
        <button
          className="professor-sidebar-toggle"
          type="button"
          onClick={toggleSidebar}
          aria-label={toggleLabel}
          title={toggleLabel}
          aria-expanded={!collapsed}
          aria-controls={contentId}
        >
          <ToggleIcon size={20} aria-hidden />
        </button>
        <div id={contentId} className="professor-sidebar-content" hidden={collapsed}>
          <Link className="professor-brand" to="/">
            <img className="professor-brand-mark" src="/AutoTA_Logo_crop.png" alt="" />
            <span>
              <b>Auto<span>TA</span></b>
              <small>AUTOMATED TEACHING ASSISTANT</small>
            </span>
          </Link>
          <div className="professor-role">
            <span className="professor-avatar">박</span>
            <span><small>로그인 역할</small><b>교수</b></span>
            <ShieldCheck size={18} aria-hidden />
          </div>
          <p className="professor-nav-label">강의 관리</p>
          <nav className="professor-nav" aria-label="교수 주 메뉴">
            {menu.map(({ path, label, icon: Icon }) => (
              <NavLink key={path} to={path} end={path !== "/problems"}>
                <Icon size={20} aria-hidden />
                <span>{label}</span>
                {path === "/review" && <i>{pendingCount}</i>}
              </NavLink>
            ))}
          </nav>
          <div className="professor-help-card">
            <span className="professor-help-icon"><BookOpen size={20} aria-hidden /></span>
            <b>도움이 필요하신가요?</b>
            <p>이용 가이드에서 채점 기준과 제출 방법을 확인하세요.</p>
            <button type="button" onClick={() => onNotify("이용 가이드를 열 준비 중이에요.")}>
              이용 가이드 보기 <span aria-hidden>→</span>
            </button>
          </div>
          <button className="professor-logout-button" type="button" onClick={() => onNotify("로그아웃 기능은 계정 연동 후 사용할 수 있어요.")}>
            <LogOut size={18} aria-hidden /> 로그아웃
          </button>
        </div>
      </aside>
      {children}
    </div>
  );
}

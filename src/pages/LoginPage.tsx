import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Code2, FileText, LockKeyhole, Mail, ShieldCheck, Users } from "lucide-react";

export function LoginPage() {
  const [role, setRole] = useState<"student" | "professor">("student");
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setMessage("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setMessage("로그인 연동이 준비되면 이곳에서 계정을 확인할 수 있어요.");
  }

  return (
    <main className="login-page">
      <section className="login-intro">
        <a className="brand" href="/" aria-label="AutoTA 홈">
          <img className="brand-mark" src="/AutoTA_Logo_crop.png" alt="" />
          <span><strong>Auto<span>TA</span></strong><small>AUTOMATED TEACHING ASSISTANT</small></span>
        </a>
        <div className="intro-copy">
          <p className="eyebrow">PYTHON ASSIGNMENT PLATFORM</p>
          <h1>코드의 결과를 넘어,<br />학습 과정을 평가합니다.</h1>
          <p className="intro-description">프로그래밍 교과목을 위한 Python 과제 제출, 자동 채점, 교수 검토 서비스를 한곳에서 이용하세요.</p>
          <ul className="intro-benefits">
            <li><Check size={18} /><span><b>신뢰할 수 있는 자동 채점</b><small>격리된 환경에서 안전하고 정확하게 실행합니다.</small></span></li>
            <li><ShieldCheck size={18} /><span><b>학습 범위 기반 검사</b><small>허용 요소를 확인하고 교수 검토를 지원합니다.</small></span></li>
          </ul>
        </div>
        <div className="intro-orb intro-orb-one" /><div className="intro-orb intro-orb-two" />
      </section>

      <section className="login-area">
        <div className="login-card">
          <header className="form-heading"><p className="form-eyebrow">WELCOME BACK</p><h2>AutoTA 로그인</h2><p>먼저 로그인할 역할을 선택해 주세요.</p></header>
          <div className="role-options" role="group" aria-label="로그인 역할">
            <button type="button" className={`role-card ${role === "student" ? "selected" : ""}`} onClick={() => setRole("student")} aria-pressed={role === "student"}>
              {role === "student" && <span className="selected-check"><Check size={14} /></span>}
              <span className="role-icon"><Code2 size={21} /></span><b>학생</b><small>문제 풀이와 채점 결과 확인</small>
            </button>
            <button type="button" className={`role-card ${role === "professor" ? "selected" : ""}`} onClick={() => setRole("professor")} aria-pressed={role === "professor"}>
              {role === "professor" && <span className="selected-check"><Check size={14} /></span>}
              <span className="role-icon muted"><FileText size={21} /></span><b>교수</b><small>과제 관리와 점수 확정</small>
            </button>
          </div>
          <form className="login-form" onSubmit={submit}>
            <label className="field-label" htmlFor="login-email">등록된 이메일</label>
            <div className="input-wrap"><Users size={18} /><input id="login-email" type="email" autoComplete="username" placeholder="name@university.ac.kr" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <label className="field-label password-label" htmlFor="login-password">비밀번호</label>
            <div className="input-wrap"><ShieldCheck size={18} /><input id="login-password" type="password" autoComplete="current-password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <div className="form-options"><label className="remember-option"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> 로그인 상태 유지</label><button type="button" className="text-button" onClick={() => setMessage("비밀번호 재설정은 관리자에게 문의해주세요.")}>비밀번호 찾기</button></div>
            {message && <p className="form-message" role="status">{message}</p>}
            <button className="login-submit" type="submit">로그인 <ArrowRight size={18} /></button>
          </form>
          <p className="security-note"><LockKeyhole size={15} /> 미리 등록된 계정의 이메일로 로그인해요. 회원가입은 지원하지 않아요.</p>
          <p className="help-note">로그인에 문제가 있나요? <button type="button" className="text-button" onClick={() => setMessage("계정 관련 문의는 시스템 관리자에게 연락해주세요.")}>관리자에게 문의</button></p>
          <a className="admin-link" href="/components">시스템 관리자 로그인</a>
        </div>
      </section>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
.login-page{min-height:100vh;display:grid;grid-template-columns:40% 60%;background:#f4f6fb;font-family:var(--font-sans);color:#101b31}
.login-intro{min-height:100vh;position:relative;overflow:hidden;background:#173e70;color:white;padding:22px clamp(32px,3.7vw,72px);display:flex;flex-direction:column;justify-content:space-between}
.brand{z-index:1;display:flex;align-items:center;gap:13px;color:white;text-decoration:none;width:max-content}.brand-mark{width:46px;height:46px;border-radius:12px;background:#fff;color:#2470ed;display:grid;place-items:center;font-size:34px;line-height:1;font-weight:500}.brand strong{display:block;font-size:37px;line-height:1.05;letter-spacing:-1.7px}.brand strong span{color:#2878fa}.brand small{display:block;color:#c3d3ef;font-size:10px;font-weight:700;line-height:1.5;letter-spacing:.15px}
.intro-copy{position:relative;z-index:1;max-width:600px;margin-top:auto;margin-bottom:40px}.eyebrow,.form-eyebrow{margin:0 0 24px;color:#2e7aff;font-size:12px;line-height:1.4;font-weight:800;letter-spacing:2px}.intro-copy h1{margin:0;color:#fff;font-size:clamp(38px,3.1vw,58px);font-weight:500;line-height:1.38;letter-spacing:-2.5px}.intro-description{max-width:590px;margin:24px 0 48px;color:#c5d5ef;font-size:15px;line-height:1.9}.intro-benefits{display:grid;gap:18px;list-style:none;margin:0;padding:0}.intro-benefits li{display:flex;align-items:flex-start;gap:16px;color:#3480ff}.intro-benefits b,.intro-benefits small{display:block}.intro-benefits b{color:#fff;font-size:13px;line-height:1.5}.intro-benefits small{margin-top:3px;color:#a9c0e2;font-size:11px;line-height:1.6}
.intro-orb{position:absolute;border:1px solid rgba(85,145,226,.1);border-radius:50%;pointer-events:none}.intro-orb-one{width:700px;height:700px;right:-390px;top:14%}.intro-orb-two{width:880px;height:880px;right:-480px;top:-12%;box-shadow:0 0 0 82px rgba(85,145,226,.025)}
.login-area{min-height:100vh;display:grid;place-items:center;padding:22px 40px}.login-card{width:min(100%,712px);min-height:calc(100vh - 44px);box-sizing:border-box;padding:clamp(38px,4.1vw,54px);border:1px solid #e1e6ef;border-radius:20px;background:#fff;box-shadow:0 20px 65px rgba(42,66,103,.07);display:flex;flex-direction:column;justify-content:center}.form-heading{margin-bottom:34px}.form-eyebrow{margin-bottom:14px;font-size:10px;letter-spacing:1.5px}.form-heading h2{margin:0;color:#111b2e;font-size:29px;font-weight:500;line-height:1.45;letter-spacing:-1px}.form-heading>p:last-child{margin:14px 0 0;color:#788397;font-size:13px;line-height:1.6}
.role-options{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:30px}.role-card{position:relative;min-height:145px;border:1px solid #e0e6f0;border-radius:13px;background:white;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;color:#151d2d;cursor:pointer;transition:border-color .15s,background .15s,box-shadow .15s}.role-card.selected{border-color:#2875fa;background:#eaf2ff;box-shadow:0 2px 0 #2875fa}.role-icon{width:44px;height:44px;border-radius:12px;background:#fff;color:#2475fa;display:grid;place-items:center}.role-icon.muted{background:#f0f2f6;color:#778196}.role-card b{font-size:13px;line-height:1.5}.role-card small{color:#8490a3;font-size:10px;line-height:1.4}.selected-check{position:absolute;right:10px;top:9px;width:23px;height:23px;border-radius:50%;display:grid;place-items:center;background:#2475f5;color:white}
.login-form{display:flex;flex-direction:column}.field-label{margin-bottom:8px;font-size:11px;line-height:1.5;font-weight:700;color:#29354a}.password-label{margin-top:17px}.input-wrap{height:48px;box-sizing:border-box;border:1px solid #e0e6f0;border-radius:10px;padding:0 15px;display:flex;align-items:center;gap:12px;color:#a0aabb;transition:border-color .15s,box-shadow .15s}.input-wrap:focus-within{border-color:#3079f5;box-shadow:0 0 0 3px rgba(48,121,245,.12)}.input-wrap input{width:100%;height:100%;border:0;outline:0;background:transparent;color:#25324a;font-size:13px}.input-wrap input::placeholder{color:#a0aabb}.form-options{display:flex;align-items:center;justify-content:space-between;margin:13px 0 20px;font-size:10px;color:#778398}.remember-option{display:flex;align-items:center;gap:8px;cursor:pointer}.remember-option input{width:14px;height:14px;margin:0;accent-color:#2475f5}.text-button{padding:0;border:0;background:none;color:#1767ec;font:inherit;cursor:pointer}.text-button:hover{text-decoration:underline}.login-submit{height:54px;border:0;border-radius:10px;background:#2471ef;box-shadow:0 8px 18px rgba(36,113,239,.22);color:white;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:11px;cursor:pointer;transition:background .15s,transform .15s}.login-submit:hover{background:#145fdb;transform:translateY(-1px)}.form-message{margin:-9px 0 12px;color:#d24555;font-size:11px;line-height:1.5}.security-note{margin:15px 0 0;display:flex;justify-content:center;align-items:center;gap:8px;color:#7b879b;font-size:10px;line-height:1.6;text-align:center}.help-note{margin:22px 0 0;text-align:center;color:#7b879b;font-size:10px;line-height:1.6}.help-note .text-button{font-size:10px}.admin-link{align-self:center;margin-top:12px;color:#8a95a8;font-size:10px;text-decoration:underline;text-underline-offset:3px}
@media(max-width:1050px){.login-page{grid-template-columns:38% 62%}.login-intro{padding-inline:30px}.intro-copy h1{font-size:clamp(34px,4vw,48px)}.login-area{padding:18px}.login-card{min-height:calc(100vh - 36px);padding:38px clamp(26px,4vw,46px)}}
@media(max-width:760px){.login-page{grid-template-columns:1fr}.login-intro{min-height:auto;padding:20px 24px 28px}.brand-mark{width:38px;height:38px;font-size:28px}.brand strong{font-size:30px}.intro-copy{margin:38px 0 0}.intro-copy .eyebrow{margin-bottom:12px}.intro-copy h1{font-size:clamp(30px,7vw,42px);letter-spacing:-1.5px}.intro-description{margin:14px 0 20px;font-size:13px}.intro-benefits{display:none}.intro-orb-one{width:400px;height:400px;right:-270px;top:-160px}.intro-orb-two{display:none}.login-area{min-height:auto;padding:18px}.login-card{min-height:0;padding:30px 24px;border-radius:16px}.form-heading{margin-bottom:24px}.form-heading h2{font-size:25px}.role-options{margin-bottom:24px}.role-card{min-height:125px}}
@media(max-width:380px){.login-area{padding:12px}.login-card{padding:25px 18px}.role-options{gap:8px}.role-card small{font-size:9px}}
`;

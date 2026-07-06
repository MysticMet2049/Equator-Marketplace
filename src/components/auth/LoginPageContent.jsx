import AuthFeedback from "./login/AuthFeedback";
import AuthModeTabs from "./login/AuthModeTabs";
import AuthSwitchLink from "./login/AuthSwitchLink";
import LoginForm from "./login/LoginForm";
import LoginHeroPanel from "./login/LoginHeroPanel";
import RegisterForm from "./login/RegisterForm";
import useLoginPageForm from "./login/useLoginPageForm";

export default function LoginPage() {
  const {
    mode,
    title,
    subtitle,
    authLoading,
    authError,
    localSuccess,
    errors,
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    showLoginPassword,
    setShowLoginPassword,
    showRegisterPassword,
    setShowRegisterPassword,
    changeMode,
    handleLoginSubmit,
    handleRegisterSubmit,
    handleRegisterFieldChange,
  } = useLoginPageForm();

  return (
    <div className="min-h-screen pt-14 flex" style={{ background: "var(--color-equator-cream)" }}>
      <LoginHeroPanel />

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <p
            className="text-xs font-semibold tracking-widest mb-2"
            style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
          >
            BIENVENUE SUR EQUATOR
          </p>

          <h1
            className="text-4xl font-light mb-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}
          >
            {title}
          </h1>

          <p className="text-sm mb-6" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
            {subtitle}
          </p>

          <AuthModeTabs mode={mode} onChangeMode={changeMode} />
          <AuthFeedback error={authError} success={localSuccess} />

          {mode === "login" ? (
            <LoginForm
              form={loginForm}
              setForm={setLoginForm}
              errors={errors}
              showPassword={showLoginPassword}
              onTogglePassword={() => setShowLoginPassword((value) => !value)}
              onSubmit={handleLoginSubmit}
              loading={authLoading}
            />
          ) : (
            <RegisterForm
              form={registerForm}
              setForm={setRegisterForm}
              errors={errors}
              showPassword={showRegisterPassword}
              onTogglePassword={() => setShowRegisterPassword((value) => !value)}
              onSubmit={handleRegisterSubmit}
              loading={authLoading}
              onFieldChange={handleRegisterFieldChange}
            />
          )}

          <AuthSwitchLink mode={mode} onChangeMode={changeMode} />
        </div>
      </div>
    </div>
  );
}

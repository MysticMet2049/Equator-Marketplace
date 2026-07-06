import AccountGuestState from "./AccountGuestState";
import AccountHeader from "./AccountHeader";
import AccountSectionRenderer from "./AccountSectionRenderer";
import AccountSidebar from "./AccountSidebar";
import useAccountPageState from "./useAccountPageState";

export default function AccountPage() {
  const state = useAccountPageState();

  if (!state.isAuthenticated) return <AccountGuestState />;

  return (
    <main data-testid="account-page" className="min-h-screen pt-14" style={{ background: "var(--color-equator-cream)" }}>
      <div data-testid="account-page-content" className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-6">
        <AccountSidebar
          profile={state.profile}
          accountInitial={state.accountInitial}
          activeSection={state.activeSection}
          setActiveSection={state.setActiveSection}
          loading={state.loading}
          onRefresh={state.refresh}
          onLogout={state.handleLogout}
        />

        <main className="flex-1 min-w-0">
          <AccountHeader activeSection={state.activeSection} loading={state.loading} saved={state.saved} />
          <AccountSectionRenderer state={state} />
        </main>
      </div>
</main>
  );
}

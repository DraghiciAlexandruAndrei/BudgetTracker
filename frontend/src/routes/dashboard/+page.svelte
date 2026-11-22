
<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  import AppLayout from "#lib/components/AppLayout.svelte";
  import { getAuthSession } from "#lib/context/auth.svelte.js";
  import "#lib/styles/dashboard.css";

  const authSession = getAuthSession();

  let isChecking = $state(true);
  let sessionError = $state("");

  const user = $derived(authSession.state.user);

  onMount(async () => {
    await authSession.initialize();

    if (authSession.state.status === "unauthenticated") {
      await goto("/login", { replace: true });
      return;
    }

    if (authSession.state.status === "error") {
      sessionError =
        authSession.state.errorMessage ??
        "Nu am putut verifica sesiunea.";
    }

    isChecking = false;
  });

  async function handleLogout() {
    authSession.signOut();
    await goto("/login", { replace: true });
  }
</script>

<svelte:head>
  <title>Dashboard | BudgetTracker</title>
  <meta
    name="description"
    content="Dashboard-ul personal BudgetTracker."
  />
</svelte:head>

{#if isChecking}
  <main class="loading-screen">
    <div class="loading-card">
      <div class="loader"></div>
      <p>Verificăm sesiunea...</p>
    </div>
  </main>

{:else if sessionError}
  <main class="loading-screen">
    <div class="error-card">
      <h2>Sesiunea nu poate fi verificată</h2>
      <p>{sessionError}</p>
      <p>Verifică dacă backend-ul rulează și încearcă din nou.</p>
      <button onclick={handleLogout}>
        Înapoi la autentificare
      </button>
    </div>
  </main>

{:else if authSession.state.status === "authenticated" && user}
  <AppLayout activePage="dashboard">
    <main class="main-content">
      <header class="topbar">
        <div>
          <div class="breadcrumb">
            Pagina principală / Dashboard
          </div>
          <h1>Dashboard</h1>
        </div>

        <div class="user-info">
          <div class="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{user.name}</strong>
            <span>Cont personal</span>
          </div>
        </div>
      </header>

      <section class="welcome-section">
        <div>
          <span class="welcome-label">BUDGETTRACKER</span>
          <h2>Bine ai venit, {user.name}!</h2>
          <p>
            Aici vei putea urmări și gestiona toate
            activitățile tale financiare.
          </p>
        </div>

        <div class="welcome-icon">↗</div>
      </section>

      <section class="section-heading">
        <div>
          <h2>Rezumat financiar</h2>
          <p>Imaginea generală a finanțelor tale.</p>
        </div>

        <span class="currency-badge">
          Monedă: {user.currency}
        </span>
      </section>

      <section class="stats-grid">
        <article class="stat-card balance-card">
          <div class="stat-top">
            <span>Sold total</span>
            <span class="stat-icon">◈</span>
          </div>

          <strong>— {user.currency}</strong>
          <p>
            Disponibil după înregistrarea tranzacțiilor
          </p>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <span>Venituri totale</span>
            <span class="stat-icon income-icon">↙</span>
          </div>

          <strong>— {user.currency}</strong>
          <p>Veniturile tale vor apărea aici</p>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <span>Cheltuieli totale</span>
            <span class="stat-icon expense-icon">↗</span>
          </div>

          <strong>— {user.currency}</strong>
          <p>Cheltuielile tale vor apărea aici</p>
        </article>
      </section>

      <section class="transactions-section">
        <div class="transactions-header">
          <div>
            <h2>Tranzacții recente</h2>
            <p>Ultimele activități financiare.</p>
          </div>

          <a href="/transactions" class="view-all-link">
            Vezi toate
          </a>
        </div>

        <div class="empty-state">
          <div class="empty-icon">⇄</div>

          <h3>Consultă istoricul tranzacțiilor</h3>

          <p>
            Accesează pagina de tranzacții pentru a vedea
            veniturile și cheltuielile înregistrate.
          </p>
        </div>
      </section>

      <footer class="dashboard-footer">
        © 2026 BudgetTracker. Toate drepturile rezervate.
      </footer>
    </main>
  </AppLayout>
{/if}

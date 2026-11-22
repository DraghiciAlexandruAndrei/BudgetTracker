
<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  import AppLayout from "#lib/components/AppLayout.svelte";
  import { getAuthSession } from "#lib/context/auth.svelte.js";
  import {
    getTransactions,
    type Transaction
  } from "#lib/services/transactions.js";

  import "#lib/styles/dashboard.css";

  const authSession = getAuthSession();

  let isChecking = $state(true);
  let isLoadingDashboard = $state(true);
  let sessionError = $state("");
  let dashboardError = $state("");

  let transactions = $state<Transaction[]>([]);

  const user = $derived(authSession.state.user);
  const currency = $derived(user?.currency ?? "RON");

  const totalIncome = $derived(
    transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0)
  );

  const totalExpenses = $derived(
    transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0)
  );

  const balance = $derived(totalIncome - totalExpenses);

  const recentTransactions = $derived(
    [...transactions]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      )
      .slice(0, 5)
  );

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

      isChecking = false;
      return;
    }

    if (authSession.state.status === "authenticated") {
      await loadDashboardData();
    }

    isChecking = false;
  });

  async function loadDashboardData() {
    isLoadingDashboard = true;
    dashboardError = "";

    try {
      transactions = await getTransactions();
    } catch (error) {
      transactions = [];

      dashboardError =
        error instanceof Error
          ? error.message
          : "Nu am putut încărca datele financiare.";
    } finally {
      isLoadingDashboard = false;
    }
  }

  async function handleLogout() {
    authSession.signOut();
    await goto("/login", { replace: true });
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  function formatDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
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
            Aici poți urmări și gestiona toate activitățile
            tale financiare.
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
          Monedă: {currency}
        </span>
      </section>

      <section class="stats-grid">
        <article class="stat-card balance-card">
          <div class="stat-top">
            <span>Sold total</span>
            <span class="stat-icon">◈</span>
          </div>

          <strong>
            {#if isLoadingDashboard || dashboardError}
              —
            {:else}
              {formatCurrency(balance)}
            {/if}
          </strong>

          <p>Venituri minus cheltuieli</p>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <span>Venituri totale</span>
            <span class="stat-icon income-icon">↙</span>
          </div>

          <strong>
            {#if isLoadingDashboard || dashboardError}
              —
            {:else}
              {formatCurrency(totalIncome)}
            {/if}
          </strong>

          <p>Venituri înregistrate</p>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <span>Cheltuieli totale</span>
            <span class="stat-icon expense-icon">↗</span>
          </div>

          <strong>
            {#if isLoadingDashboard || dashboardError}
              —
            {:else}
              {formatCurrency(totalExpenses)}
            {/if}
          </strong>

          <p>Cheltuieli înregistrate</p>
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

        {#if isLoadingDashboard}
          <div class="empty-state">
            <div class="loader"></div>
            <p>Se încarcă tranzacțiile...</p>
          </div>

        {:else if dashboardError}
          <div class="empty-state dashboard-error">
            <h3>Nu am putut încărca datele</h3>
            <p>{dashboardError}</p>

            <button
              class="dashboard-retry-button"
              onclick={loadDashboardData}
            >
              Încearcă din nou
            </button>
          </div>

        {:else if recentTransactions.length === 0}
          <div class="empty-state">
            <div class="empty-icon">⇄</div>
            <h3>Nu există tranzacții</h3>

            <p>
              Adaugă prima tranzacție pentru a vedea aici
              activitatea ta financiară.
            </p>

            <a href="/transactions" class="view-all-link">
              Adaugă tranzacție
            </a>
          </div>

        {:else}
          <div class="recent-transactions-list">
            {#each recentTransactions as transaction (transaction._id)}
              <article class="recent-transaction-item">

                <div
                  class="recent-transaction-icon"
                  class:income-transaction={transaction.type === "income"}
                  class:expense-transaction={transaction.type === "expense"}
                >
                  {transaction.type === "income" ? "↙" : "↗"}
                </div>

                <div class="recent-transaction-details">
                  <strong>{transaction.category}</strong>
                  <span>
                    {transaction.note || (transaction.type === "income"
                      ? "Venit"
                      : "Cheltuială")}
                  </span>
                  <small>{formatDate(transaction.date)}</small>
                </div>

                <strong
                  class="recent-transaction-amount"
                  class:income-amount={transaction.type === "income"}
                  class:expense-amount={transaction.type === "expense"}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </strong>

              </article>
            {/each}
          </div>
        {/if}
      </section>

      <footer class="dashboard-footer">
        © 2026 BudgetTracker. Toate drepturile rezervate.
      </footer>

    </main>
  </AppLayout>
{/if}

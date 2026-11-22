
<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  import "#lib/styles/transactions.css";

  import AppLayout from "#lib/components/AppLayout.svelte";
  import TransactionForm from "#lib/components/TransactionForm.svelte";

  import { getAuthSession } from "#lib/context/auth.svelte.js";

  import {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    type Transaction,
    type TransactionInput
  } from "#lib/services/transactions.js";

  const authSession = getAuthSession();

  let isCheckingSession = $state(true);
  let isLoading = $state(true);
  let sessionError = $state("");
  let errorMessage = $state("");

  let transactions = $state<Transaction[]>([]);

  let showTransactionForm = $state(false);
  let selectedTransaction = $state<Transaction | null>(null);

  let totalIncome = $derived(
    transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0)
  );

  let totalExpenses = $derived(
    transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0)
  );

  let balance = $derived(totalIncome - totalExpenses);

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

      isCheckingSession = false;
      return;
    }

    isCheckingSession = false;
    await loadTransactions();
  });

  async function loadTransactions() {
    isLoading = true;
    errorMessage = "";

    try {
      transactions = await getTransactions();
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : "Nu am putut încărca tranzacțiile.";
    } finally {
      isLoading = false;
    }
  }

  function openAddForm() {
    selectedTransaction = null;
    showTransactionForm = true;
  }

  function openEditForm(transaction: Transaction) {
    selectedTransaction = transaction;
    showTransactionForm = true;
  }

  function closeTransactionForm() {
    showTransactionForm = false;
    selectedTransaction = null;
  }

  async function handleSaveTransaction(data: TransactionInput) {
    if (selectedTransaction) {
      await updateTransaction(selectedTransaction._id, data);
    } else {
      await createTransaction(data);
    }

    closeTransactionForm();
    await loadTransactions();
  }
  async function handleDeleteTransaction(transaction: Transaction) {
  const confirmed = window.confirm(
    `Sigur dorești să ștergi tranzacția "${transaction.category}"?`
  );

  if (!confirmed) return;

  try {
    await deleteTransaction(transaction._id);
    await loadTransactions();
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : "Nu am putut șterge tranzacția.";
  }
}

  function formatAmount(amount: number): string {
    return new Intl.NumberFormat("ro-RO", {
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
  <title>Tranzacții | BudgetTracker</title>
  <meta
    name="description"
    content="Vizualizează și gestionează tranzacțiile tale financiare."
  />
</svelte:head>

{#if isCheckingSession}
  <main class="transactions-page-state">
    <div class="loader"></div>
    <p>Verificăm sesiunea...</p>
  </main>

{:else if sessionError}
  <main class="transactions-page-state error-state">
    <div class="state-icon">!</div>
    <h3>Sesiunea nu poate fi verificată</h3>
    <p>{sessionError}</p>
    <p>Verifică dacă backend-ul rulează și încearcă din nou.</p>
    <button
      class="retry-button"
      onclick={() => goto("/login", { replace: true })}
    >
      Înapoi la autentificare
    </button>
  </main>

{:else if authSession.state.status === "authenticated"}
  <AppLayout activePage="transactions">
    <main class="main-content transactions-page">

      <header class="topbar">
        <div>
          <div class="breadcrumb">Dashboard / Tranzacții</div>
          <h1>Tranzacții</h1>
          <p>Gestionează veniturile și cheltuielile tale.</p>
        </div>

        <div class="page-tag">FINANCIAL OVERVIEW</div>
      </header>

      <section class="summary-grid">
        <article class="summary-card">
          <div class="summary-label">Total venituri</div>
          <div class="summary-value positive">
            +{formatAmount(totalIncome)}
          </div>
          <div class="summary-description">
            Venituri înregistrate
          </div>
        </article>

        <article class="summary-card">
          <div class="summary-label">Total cheltuieli</div>
          <div class="summary-value negative">
            -{formatAmount(totalExpenses)}
          </div>
          <div class="summary-description">
            Cheltuieli înregistrate
          </div>
        </article>

        <article class="summary-card">
          <div class="summary-label">Sold rezultat</div>
          <div
            class="summary-value"
            class:positive={balance >= 0}
            class:negative={balance < 0}
          >
            {formatAmount(balance)}
          </div>
          <div class="summary-description">
            Venituri minus cheltuieli
          </div>
        </article>

        <article class="summary-card">
          <div class="summary-label">Număr tranzacții</div>
          <div class="summary-value">
            {transactions.length}
          </div>
          <div class="summary-description">
            Înregistrări în cont
          </div>
        </article>
      </section>

      <section class="transactions-card">
        <div class="section-header">
          <div>
            <h2>Istoric tranzacții</h2>
            <p>Toate tranzacțiile contului tău</p>
          </div>

          <div class="transactions-header-actions">
            <button
              class="add-transaction-button"
              onclick={openAddForm}
            >
              + Adaugă tranzacție
            </button>

            <button
              class="refresh-button"
              onclick={loadTransactions}
              disabled={isLoading}
            >
              ↻ Reîmprospătează
            </button>
          </div>
        </div>

        {#if isLoading}
          <div class="state-message">
            <div class="loader"></div>
            <p>Se încarcă tranzacțiile...</p>
          </div>

        {:else if errorMessage}
          <div class="state-message error-state">
            <div class="state-icon">!</div>
            <h3>Nu am putut încărca datele</h3>
            <p>{errorMessage}</p>

            <button
              class="retry-button"
              onclick={loadTransactions}
            >
              Încearcă din nou
            </button>
          </div>

        {:else if transactions.length === 0}
          <div class="state-message">
            <div class="state-icon">⇄</div>
            <h3>Nu există tranzacții</h3>
            <p>
              Tranzacțiile tale vor apărea aici după ce le adaugi.
            </p>

            <button
              class="add-transaction-button"
              onclick={openAddForm}
            >
              + Adaugă prima tranzacție
            </button>
          </div>

        {:else}
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Categorie</th>
                  <th>Descriere</th>
                  <th>Tip</th>
                  <th class="amount-column">Sumă</th>
                  <th>Acțiuni</th>
                </tr>
              </thead>

              <tbody>
                {#each transactions as transaction (transaction._id)}
                  <tr>
                    <td class="date-cell">
                      {formatDate(transaction.date)}
                    </td>

                    <td class="category-cell">
                      {transaction.category}
                    </td>

                    <td class="note-cell">
                      {transaction.note || "—"}
                    </td>

                    <td>
                      {#if transaction.type === "income"}
                        <span class="type-badge income-badge">
                          Venit
                        </span>
                      {:else}
                        <span class="type-badge expense-badge">
                          Cheltuială
                        </span>
                      {/if}
                    </td>

                    <td class="amount-column">
                      <span
                        class="transaction-amount"
                        class:positive={transaction.type === "income"}
                        class:negative={transaction.type === "expense"}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatAmount(transaction.amount)}
                      </span>
                    </td>

                    <td>
  <div class="transaction-actions">
    <button
      class="edit-transaction-button"
      onclick={() => openEditForm(transaction)}
    >
      Editează
    </button>

    <button
      class="delete-transaction-button"
      onclick={() => handleDeleteTransaction(transaction)}
    >
      Șterge
    </button>
  </div>
</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="table-footer">
            Sunt afișate {transactions.length} tranzacții.
          </div>
        {/if}
      </section>

      {#if showTransactionForm}
        <TransactionForm
          transaction={selectedTransaction}
          onSave={handleSaveTransaction}
          onCancel={closeTransactionForm}
        />
      {/if}

    </main>
  </AppLayout>
{/if}


<script lang="ts">
  import { goto } from "$app/navigation";
  import type { Snippet } from "svelte";
  import AppLayout from "#lib/components/AppLayout.svelte";
  import { getAuthSession } from "#lib/context/auth.svelte.js";
  import "#lib/styles/app-layout.css";

  type ActivePage = "dashboard" | "transactions";

  type Props = {
  activePage: ActivePage;
  children: Snippet;
};

let {
  activePage,
  children
}: Props = $props();

  const authSession = getAuthSession();
  const user = $derived(authSession.state.user);

  async function handleLogout() {
    authSession.signOut();
    await goto("/login", { replace: true });
  }
</script>

<div class="app-layout">
  <aside class="sidebar">
    <a href="/dashboard" class="brand">
      <div class="brand-icon">B</div>
      <span>BudgetTracker</span>
    </a>

    <div class="sidebar-label">MENIU PRINCIPAL</div>

    <nav aria-label="Navigare principală">
      <a
        href="/dashboard"
        class="nav-item"
        class:active={activePage === "dashboard"}
        aria-current={activePage === "dashboard" ? "page" : undefined}
      >
        <span class="nav-icon">▦</span>
        Dashboard
      </a>

      <a
        href="/transactions"
        class="nav-item"
        class:active={activePage === "transactions"}
        aria-current={activePage === "transactions" ? "page" : undefined}
      >
        <span class="nav-icon">⇄</span>
        Tranzacții
      </a>

      <span class="nav-item disabled" aria-disabled="true">
        <span class="nav-icon">◷</span>
        Bugete
        <small>În curând</small>
      </span>

      <span class="nav-item disabled" aria-disabled="true">
        <span class="nav-icon">▥</span>
        Rapoarte
        <small>În curând</small>
      </span>
    </nav>

    <div class="sidebar-bottom">
      {#if user}
        <div class="profile">
          <div class="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div class="profile-details">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </div>
      {/if}

      <button class="logout-button" onclick={handleLogout}>
        <span>↪</span>
        Deconectare
      </button>
    </div>
  </aside>

  <div class="app-main">
    {@render children()}
  </div>
</div>

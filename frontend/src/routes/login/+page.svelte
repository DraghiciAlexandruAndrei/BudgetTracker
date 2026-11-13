<script lang="ts">
import { getAuthSession } from "#lib/context/auth.svelte.js";

const authSession = getAuthSession();

  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    errorMessage = "";
    successMessage = "";

    if (!email.trim() || !password) {
      errorMessage = "Completează toate câmpurile.";
      return;
    }

    loading = true;

    try {
      const user = await authSession.signIn(
        email.trim(), 
        password
      );

      successMessage = `Bun venit, ${user.name}! Autentificarea a reușit.`;
      password = "";
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : "A apărut o eroare la autentificare.";
    } finally {
      loading = false;
    }
  }
  function handleLogout() {
  authSession.signOut();

  successMessage = "Te-ai deconectat cu succes.";
  password = "";
}
</script>

<svelte:head>
  <title>Autentificare | BudgetTracker</title>
  <meta
    name="description"
    content="Autentifică-te în BudgetTracker pentru a-ți administra bugetul personal."
  />
</svelte:head>

<div class="auth-page">
  <aside class="brand-panel">
    <div class="brand">
      <div class="brand-icon">B</div>
      <span>BudgetTracker</span>
    </div>

    <div class="brand-content">
      <span class="eyebrow">CONTROLUL BANILOR TĂI</span>
      <h1>Gestionează-ți banii. Construiește-ți viitorul.</h1>
      <p>
        Urmărește veniturile, controlează cheltuielile
        și gestionează-ți bugetul într-un singur loc.
      </p>

      <div class="feature-list">
        <div class="feature">
          <span class="feature-icon">✓</span>
          Monitorizează veniturile și cheltuielile
        </div>
        <div class="feature">
          <span class="feature-icon">✓</span>
          Stabilește bugete personale
        </div>
        <div class="feature">
          <span class="feature-icon">✓</span>
          Analizează evoluția financiară
        </div>
      </div>
    </div>

    <p class="brand-footer">
      Bugetul tău. Deciziile tale. Viitorul tău.
    </p>
  </aside>

  <main class="form-panel">
    <div class="mobile-brand">
      <div class="brand-icon">B</div>
      <span>BudgetTracker</span>
    </div>

    <section class="login-card">
      <div class="welcome-label">BUN VENIT ÎNAPOI</div>

      <h2>Autentificare</h2>
      <p class="description">
        Introdu datele contului tău pentru a continua.
      </p>

      {#if errorMessage}
        <div class="message error" role="alert">
          <span>!</span>
          {errorMessage}
        </div>
      {/if}

      {#if successMessage}
        <div class="message success" role="status">
          <span>✓</span>
          {successMessage}
        </div>
      {/if}

{#if authSession.state.status === "authenticated" && authSession.state.user}
  <div class="session-panel">
    <div>
      <strong>Sesiune activă</strong>
      <p>Autentificat ca {authSession.state.user.name}</p>
      <p>{authSession.state.user.email}</p>
    </div>

    <button
      type="button"
      class="logout-button"
      onclick={handleLogout}
    >
      Deconectare
    </button>
  </div>
{/if}

      <form onsubmit={handleSubmit}>
        <div class="form-group">
          <label for="email">Adresă de email</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="nume@exemplu.ro"
            autocomplete="username"
            required
            maxlength="254"
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="password">Parolă</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="Introdu parola"
            autocomplete="current-password"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {#if loading}
            Se autentifică...
          {:else}
            Autentificare
            <span aria-hidden="true">→</span>
          {/if}
        </button>
      </form>

      <div class="register-link">
        Nu ai încă un cont?
        <a href="/register">Creează un cont</a>
      </div>

      <div class="card-footer">
        © 2026 BudgetTracker. Toate drepturile rezervate.
      </div>
    </section>
  </main>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  .auth-page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: #f7f9fc;
    color: #172033;
    font-family: Arial, Helvetica, sans-serif;
  }

  .brand-panel {
    background: #101d33;
    color: white;
    padding: 42px 9%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
    font-size: 21px;
    letter-spacing: -0.5px;
  }

  .brand-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: #19a875;
    display: grid;
    place-items: center;
    color: white;
    font-size: 23px;
    font-weight: 800;
  }

  .brand-content {
    max-width: 500px;
    margin: 65px auto;
  }

  .eyebrow,
  .welcome-label {
    color: #19a875;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
  }

  .brand-content h1 {
    font-size: clamp(34px, 4vw, 53px);
    line-height: 1.15;
    letter-spacing: -1.8px;
    margin: 22px 0;
  }

  .brand-content p {
    color: #bdc8d9;
    font-size: 16px;
    line-height: 1.8;
  }

  .feature-list {
    display: grid;
    gap: 20px;
    margin-top: 40px;
  }

  .feature {
    display: flex;
    align-items: center;
    gap: 13px;
    color: #e2e9f1;
    font-size: 14px;
  }

  .feature-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: rgba(25, 168, 117, 0.18);
    color: #38d49c;
  }

  .brand-footer {
    color: #8493aa;
    font-size: 12px;
  }

  .form-panel {
    display: grid;
    place-items: center;
    padding: 45px 25px;
  }

  .login-card {
    background: white;
    width: 100%;
    max-width: 440px;
    border: 1px solid #e9edf3;
    border-radius: 18px;
    padding: 42px;
    box-shadow: 0 15px 50px rgba(16, 29, 51, 0.06);
  }

  .login-card h2 {
    font-size: 30px;
    margin: 13px 0 8px;
    letter-spacing: -0.8px;
  }

  .description {
    color: #788397;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 32px;
  }

  .form-group {
    display: grid;
    gap: 9px;
    margin-bottom: 22px;
  }

  .form-group label {
    font-size: 13px;
    font-weight: 700;
    color: #29374d;
  }

  .form-group input {
    height: 48px;
    width: 100%;
    padding: 0 14px;
    border: 1px solid #dce3ec;
    border-radius: 8px;
    background: white;
    color: #172033;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .form-group input:focus {
    border-color: #19a875;
    box-shadow: 0 0 0 3px rgba(25, 168, 117, 0.12);
  }

  .form-group input:disabled {
    background: #f3f5f7;
    cursor: not-allowed;
  }

  button {
    width: 100%;
    height: 49px;
    border: none;
    border-radius: 8px;
    background: #15996a;
    color: white;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  button:hover:not(:disabled) {
    background: #107c56;
  }

  button:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .message {
    padding: 12px;
    margin-bottom: 20px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.5;
    display: flex;
    gap: 9px;
  }

  .error {
    background: #fff0f0;
    color: #ba3131;
  }

  .success {
    background: #e9f8f1;
    color: #137a50;
  }

  .register-link {
    text-align: center;
    margin-top: 28px;
    color: #788397;
    font-size: 13px;
  }

  .register-link a {
    color: #15996a;
    font-weight: 700;
    text-decoration: none;
  }

  .register-link a:hover {
    text-decoration: underline;
  }

  .card-footer {
    text-align: center;
    color: #a1aab8;
    font-size: 11px;
    margin-top: 43px;
  }

  .mobile-brand {
    display: none;
  }

  @media (max-width: 850px) {
    .auth-page {
      grid-template-columns: 1fr;
    }

    .brand-panel {
      display: none;
    }

    .form-panel {
      padding: 35px 20px;
    }

    .mobile-brand {
      display: flex;
      align-items: center;
      gap: 11px;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 30px;
    }
  }

  @media (max-width: 480px) {
    .login-card {
      padding: 28px 22px;
    }

    .form-panel {
      padding: 25px 16px;
    }
  }
  .session-panel {
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 10px;
  background: #e9f8f1;
  color: #137a50;
}

.session-panel p {
  margin: 6px 0 0;
  font-size: 13px;
}

.logout-button {
  height: 38px;
  margin-top: 12px;
  background: #ffffff;
  color: #137a50;
  border: 1px solid #b8e5cf;
}

.logout-button:hover:not(:disabled) {
  background: #d8f1e4;
}
</style>

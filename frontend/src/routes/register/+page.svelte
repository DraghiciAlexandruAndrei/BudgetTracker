
<script lang="ts">
  import { register } from "#lib/services/auth.js";

  type Currency = "RON" | "EUR" | "USD";

  let name = $state("");
  let email = $state("");
  let password = $state("");
  let confirmPassword = $state("");
  let currency = $state<Currency>("RON");

  let loading = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    errorMessage = "";
    successMessage = "";

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    // Name validation
    if (normalizedName.length < 2 || normalizedName.length > 80) {
      errorMessage = "Numele trebuie să conțină între 2 și 80 de caractere.";
      return;
    }

    // Email validation
    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      errorMessage = "Introdu o adresă de email validă.";
      return;
    }

    // Password validation
    const passwordBytes = new TextEncoder().encode(password).length;

    if (password.length < 8) {
      errorMessage = "Parola trebuie să conțină minimum 8 caractere.";
      return;
    }

    if (passwordBytes > 72) {
      errorMessage = "Parola nu poate depăși 72 de bytes.";
      return;
    }

    if (password !== confirmPassword) {
      errorMessage = "Parolele nu coincid.";
      return;
    }

    loading = true;

    try {
      const user = await register(
        normalizedName,
        normalizedEmail,
        password,
        currency
      );

      successMessage = `Contul a fost creat cu succes pentru ${user.name}!`;

      name = "";
      email = "";
      password = "";
      confirmPassword = "";
      currency = "RON";

    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : "A apărut o eroare la crearea contului.";
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Creare cont | BudgetTracker</title>
  <meta
    name="description"
    content="Creează un cont BudgetTracker și începe să-ți gestionezi finanțele personale."
  />
</svelte:head>

<div class="auth-page">
  <aside class="brand-panel">
    <div class="brand">
      <div class="brand-icon">B</div>
      <span>BudgetTracker</span>
    </div>

    <div class="brand-content">
      <span class="eyebrow">PRIMUL PAS SPRE CONTROL FINANCIAR</span>

      <h1>Începe să-ți gestionezi banii mai inteligent.</h1>

      <p>
        Creează-ți contul și descoperă o modalitate
        simplă de a urmări și planifica finanțele personale.
      </p>

      <div class="feature-list">
        <div class="feature">
          <span class="feature-icon">✓</span>
          Gestionează toate tranzacțiile
        </div>

        <div class="feature">
          <span class="feature-icon">✓</span>
          Stabilește obiective financiare
        </div>

        <div class="feature">
          <span class="feature-icon">✓</span>
          Monitorizează bugetul lunar
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

    <section class="register-card">
      <div class="welcome-label">ALĂTURĂ-TE NOUĂ</div>

      <h2>Creează un cont</h2>

      <p class="description">
        Completează informațiile pentru a începe.
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

      <form onsubmit={handleSubmit}>
        <div class="form-group">
          <label for="name">Nume complet</label>

          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="Numele tău"
            autocomplete="name"
            minlength="2"
            maxlength="80"
            required
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="email">Adresă de email</label>

          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="nume@exemplu.ro"
            autocomplete="email"
            maxlength="254"
            required
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="password">Parolă</label>

          <input
            id="password"
            type="password"
            bind:value={password}
            placeholder="Minimum 8 caractere"
            autocomplete="new-password"
            minlength="8"
            required
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmă parola</label>

          <input
            id="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            placeholder="Introdu din nou parola"
            autocomplete="new-password"
            minlength="8"
            required
            disabled={loading}
          />
        </div>

        <div class="form-group">
          <label for="currency">Moneda preferată</label>

          <select
            id="currency"
            bind:value={currency}
            disabled={loading}
          >
            <option value="RON">RON - Leu românesc</option>
            <option value="EUR">EUR - Euro</option>
            <option value="USD">USD - Dolar american</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {#if loading}
            Se creează contul...
          {:else}
            Creează contul
            <span aria-hidden="true">→</span>
          {/if}
        </button>
      </form>

      <div class="login-link">
        Ai deja un cont?
        <a href="/login">Autentifică-te</a>
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
    padding: 35px 25px;
  }

  .register-card {
    background: white;
    width: 100%;
    max-width: 460px;
    border: 1px solid #e9edf3;
    border-radius: 18px;
    padding: 36px 42px;
    box-shadow: 0 15px 50px rgba(16, 29, 51, 0.06);
  }

  .register-card h2 {
    font-size: 30px;
    margin: 13px 0 8px;
    letter-spacing: -0.8px;
  }

  .description {
    color: #788397;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 25px;
  }

  .form-group {
    display: grid;
    gap: 8px;
    margin-bottom: 16px;
  }

  .form-group label {
    font-size: 13px;
    font-weight: 700;
    color: #29374d;
  }

  .form-group input,
  .form-group select {
    height: 45px;
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

  .form-group input:focus,
  .form-group select:focus {
    border-color: #19a875;
    box-shadow: 0 0 0 3px rgba(25, 168, 117, 0.12);
  }

  button {
    width: 100%;
    height: 49px;
    margin-top: 8px;
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
    margin-bottom: 18px;
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

  .login-link {
    text-align: center;
    margin-top: 24px;
    color: #788397;
    font-size: 13px;
  }

  .login-link a {
    color: #15996a;
    font-weight: 700;
    text-decoration: none;
  }

  .login-link a:hover {
    text-decoration: underline;
  }

  .card-footer {
    text-align: center;
    color: #a1aab8;
    font-size: 11px;
    margin-top: 30px;
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
      padding: 30px 20px;
    }

    .mobile-brand {
      display: flex;
      align-items: center;
      gap: 11px;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 25px;
    }
  }

  @media (max-width: 480px) {
    .register-card {
      padding: 28px 22px;
    }

    .form-panel {
      padding: 24px 16px;
    }
  }
</style>

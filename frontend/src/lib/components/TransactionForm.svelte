<script lang="ts">
  import type {
    Transaction,
    TransactionInput,
    TransactionType
  } from "#lib/services/transactions.js";

  import "#lib/styles/transaction-form.css";

  type Props = {
    transaction?: Transaction | null;
    onSave: (data: TransactionInput) => Promise<void>;
    onCancel: () => void;
  };

  let { transaction = null, onSave, onCancel }: Props = $props();

 
  let type = $state<TransactionType>("expense");
  let amount = $state("");
  let date = $state(new Date().toISOString().slice(0, 10));
  let category = $state("");
  let note = $state("");

  let isSaving = $state(false);
  let errorMessage = $state("");

  // Initialize or update the form when the selected transaction changes.
  $effect(() => {
    const current = transaction;

    type = current?.type ?? "expense";
    amount = current?.amount?.toString() ?? "";
    date = current?.date
      ? current.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    category = current?.category ?? "";
    note = current?.note ?? "";
    errorMessage = "";
  });


  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errorMessage = "";

    const amountValue = String(amount).trim();
    const parsedAmount = Number(amountValue);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      errorMessage = "Enter a valid amount greater than zero.";
      return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(amountValue)){
      errorMessage = "Amount can have at most two decimal places.";
      return;
    }

    if (!date) {
      errorMessage = "Please select a date.";
      return;
    }

    if (!category.trim() || category.trim().length < 2) {
      errorMessage = "Category must contain at least 2 characters.";
      return;
    }

    const data: TransactionInput = {
      type,
      amount: parsedAmount,
      date,
      category: category.trim(),
      note: note.trim()
    };

    isSaving = true;

    try {
      await onSave(data);
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : "Could not save the transaction.";
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="transaction-form-overlay">
  <dialog
  open
  class="transaction-form-modal"
  aria-labelledby="transaction-form-title"
>
    <div class="transaction-form-header">
      <div>
        <p class="transaction-form-eyebrow">
          TRANSACTION MANAGEMENT
        </p>

        <h2 id="transaction-form-title">
          {transaction ? "Edit transaction" : "Add transaction"}
        </h2>
      </div>

      <button
        type="button"
        class="transaction-form-close"
        onclick={onCancel}
        aria-label="Close form"
        disabled={isSaving}
      >
        ×
      </button>
    </div>

    <form onsubmit={handleSubmit}>
      <div class="transaction-form-type">
        <label
          class:active={type === "income"}
          class="type-option income-option"
        >
          <input
            type="radio"
            name="type"
            value="income"
            bind:group={type}
            disabled={isSaving}
          />
          <span>Income</span>
        </label>

        <label
          class:active={type === "expense"}
          class="type-option expense-option"
        >
          <input
            type="radio"
            name="type"
            value="expense"
            bind:group={type}
            disabled={isSaving}
          />
          <span>Expense</span>
        </label>
      </div>

      <div class="form-field">
        <label for="transaction-amount">Amount</label>
        <input
          id="transaction-amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          bind:value={amount}
          required
          disabled={isSaving}
        />
      </div>

      <div class="form-field">
        <label for="transaction-date">Date</label>
        <input
          id="transaction-date"
          type="date"
          bind:value={date}
          required
          disabled={isSaving}
        />
      </div>

      <div class="form-field">
        <label for="transaction-category">Category</label>
        <input
          id="transaction-category"
          type="text"
          placeholder="e.g. Food, Salary, Transport"
          maxlength="50"
          bind:value={category}
          required
          disabled={isSaving}
        />
      </div>

      <div class="form-field">
        <label for="transaction-note">Note</label>
        <textarea
          id="transaction-note"
          placeholder="Add a description (optional)"
          maxlength="500"
          rows="3"
          bind:value={note}
          disabled={isSaving}
        ></textarea>
      </div>

      {#if errorMessage}
        <p class="transaction-form-error" role="alert">
          {errorMessage}
        </p>
      {/if}

      <div class="transaction-form-actions">
        <button
          type="button"
          class="form-cancel-button"
          onclick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>

        <button
  type="submit"
  class="form-save-button"
  disabled={isSaving}
  onclick={() => console.log("SAVE BUTTON CLICKED")}
>
  {isSaving
    ? "Saving..."
    : transaction
      ? "Save changes"
      : "Add transaction"}
</button>
      </div>
    </form>
  </dialog>
</div>

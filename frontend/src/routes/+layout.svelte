
<script lang="ts">
  import "./layout.css";
  import { onMount } from "svelte";

  import {
    createAuthSession,
    setAuthSession
  } from "#lib/context/auth.svelte.js";

  let { children } = $props();

  // Create an independent authentication session
  // for this application instance.
  const authSession = createAuthSession();

  setAuthSession(authSession);

  // Restore the session only in the browser.
  onMount(() => {
    void authSession.initialize();
  });
</script>

{@render children()}

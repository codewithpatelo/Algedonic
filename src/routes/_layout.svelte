<script>
  import { stores } from "@sapper/app";
  const { session } = stores();
  import Navbar from "../components/Navbar.svelte";
  import Sidebar from "../components/Sidebar.svelte";

  export let segment;

  let title = "Algedonic";

  function decollapse_dropdowns() {
    if ($session.notifications_on == true) {
      $session.notifications_on = false;
    }

    if ($session.profile_on == true) {
      $session.profile_on = false;
    }
  }
</script>

<svelte:head>
  <title>{title}</title>

</svelte:head>

{#if segment == 'auth'}
  <slot />
{:else if segment == 'pages'}
  <slot />
{:else}
  <Navbar />

  <Sidebar />

  <div id="main" on:click={decollapse_dropdowns}>

    <slot />

  </div>
{/if}

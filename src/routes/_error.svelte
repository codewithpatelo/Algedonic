<script>
  export let status;
  export let error;
  const dev = process.env.NODE_ENV === "development";

</script>

<style>
  :global(nav) {
    display: block;
  }

  :global(aside) {
    display: block;
  }
</style>

<svelte:head>
  <title>{status}</title>
  <link rel="stylesheet" type="text/css" href="page-404.css" />
</svelte:head>

<div class="row">
  <div class="col s12">
    <div class="container">
      <div class="section section-404 p-0 m-0 height-100vh">
        <div class="row">
          <!-- 404 -->
          <div class="col s12 center-align white">
            <img src="error-404.png" class="bg-image-404" alt="" />
            <h1 class="error-code m-0">{status}</h1>

            <h6>Details: {error.message}</h6>
            <a
              class="btn waves-effect waves-light
              gradient-45deg-deep-purple-blue gradient-shadow mb-4"
              href="javascript:history.back()">
              Go back
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="content-overlay" />
  </div>
</div>

{#if dev && error.stack}
  <pre>{error.stack}</pre>
{/if}

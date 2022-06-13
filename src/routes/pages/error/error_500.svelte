<script context="module">
  let error;

  export async function preload(page, session) {
    error = page.query.error;
    console.log(error);
  }
</script>

<svelte:head>
  <title>500</title>
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
            <h1 class="error-code m-0">500</h1>
            <h6 class="mb-2">Login does match any user in our database</h6>
            <a
              class="btn waves-effect waves-light
              gradient-45deg-deep-purple-blue gradient-shadow mb-4"
              href="/auth/login">
              Back TO Login
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="content-overlay" />
  </div>
</div>

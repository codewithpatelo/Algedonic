<script>
  import Login from "./login.svelte";

  import Row from "sveltestrap/src/Row.svelte";
  import Container from "sveltestrap/src/Container.svelte";

  export let segment;
</script>

<div id="layoutAuthentication" class="bg-primary">
  <div id="layoutAuthentication_content">
    <main>
      <Container>
        <Row class="justify-content-center">
          {#if segment === 'login'}
            <Login />
     
          {/if}
        </Row>
        <div class="row">
          <div class="col m4 s4" />
          <div class="col m4 s4">
            <small>
              Created by <b>Patricio J. Gerpe</b>
            </small>
          </div>
          <div class="col m4 s4" />
        </div>
      </Container>
    </main>
  </div>

</div>

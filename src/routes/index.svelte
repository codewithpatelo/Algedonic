<script context="module">
  export async function preload( session) {
    try {
      const user = session.user;


        return this.redirect(302, "/auth/login"); // More efficient with goto
      
    } catch (err) {
    }
  }
</script>

<script>
  import { stores } from "@sapper/app";


  const { session } = stores();

  let title = "Algedonic";
</script>

<svelte:head>
  <title>{title}</title>
</svelte:head>

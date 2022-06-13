<script>
  export let errors;
</script>

{#if errors}
  {#each Object.keys(errors) as key}
    <div class="card-alert card red lighten-5">
      <div class="card-content red-text">
        <small>
          <i class="material-icons">error</i>
          {errors[key]}
        </small>
      </div>
    </div>
  {/each}
{/if}

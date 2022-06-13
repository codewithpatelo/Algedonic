<script context="module">
  export async function preload(page, session) {
    try {
      const user = session.user;

      if (user != undefined && session.ok == true) {
        //return this.redirect(302, '/profile/dashboard');
      }

      return user;
    } catch (err) {
      return this.error("500", err);
    }
  }
</script>

<script>
  import { goto, stores } from "@sapper/app";


  import ListErrors from "../../components/ListErrors.svelte";

  const { session } = stores();



  let user = "";
  let password = "";
  let errors = [];

  let not_loading = true;
  let inputs_state = " ";



  async function submit(event) {
    try {
      not_loading = false;
      goto("/moods");
        history.go(0);
    
   
    } catch (err) {
      errors = ['Error going to site.']
    
    }
  }
</script>

<svelte:head>

  <title>Algedonic - LogIn</title>

</svelte:head>

<div class="row">
  <div class="col s12">
    <div class="container">
      <div id="login-page" class="row">

        <div
          class="col s12 m6 l4 z-depth-4 card-panel border-radius-6 login-card
          bg-opacity-8"
          style="border-radius: 22px; background: #ededed; box-shadow: 11px 11px
          22px #c7c7c7, -11px -11px 22px #ffffff;"
        >
          {#if not_loading}
            <form class="login-form" on:submit|preventDefault={submit}>
              <div class="row">
                <div class="input-field col s12">
                  <h5 class="ml-4">
                    <img src="logo2.png" style="width: 13vh;" alt="logo" />
                    Welcome to Algedonic Demo!
                  </h5>

                  <small>
                    While we're more connected than ever in history thanks to
                    technology. More often than not, we can see people
                    struggling with complex emotions and moods. They/We're coping with
                    such emotions alone, and they/we might think they/we're the only ones
                    experiencing such hardships. Now, as working-class people,
                    while we keep our minds busy over the 5/9 routine, sometimes
                    we lose perspective on how common and pandemic this issue really is. Not to mention how
                    shared those emotions are with your peers. Widespread depression and anxiety is, in fact, nowadays a
                    global public health issue. But, what if we, collectively, can help each other to make something out this reality?
                    The fact that people starting experincing loniness don't know about each other and their coping strategies,
                    undermines opportunities for mutual-aid and collective
                    action. Algedonic use cybernetic technology (an algedometer) to collect data about affective states
                    from working people. Algedonic not only shows you that you're not the only one fealing that way but encourages you and connect with people from the community to actually brainstorm structural strategies of mutual-aid and collection action to tackle such issues shared by the community.
                    <on class="" />
                  </small>

                  <ListErrors {errors} />
                </div>

              </div>
              
             
              <div class="row">
                <div class="col s12 m12 l12 ml-2 mt-1" />
              </div>

              <div class="row">
                <div class="input-field col s12">
                  <button
                    type="submit"
                    class="btn waves-effect waves-light border-round blue col
                    s12"
      
                  >
                    Let's Start!
                  </button>
                </div>
              </div>

              
            </form>
          {:else}
            <p>
              Loading...
              <small>Please wait.</small>
            </p>
            <div class="progress" style="background-color: #ede7f3 !important;">
              <div
                class="indeterminate"
                style="background-color: #0099cc !important;"
              />
            </div>
          {/if}
        </div>
        <!--End CARD Panel -->
        {#if not_loading}
          <div />
        {/if}
      </div>
    </div>
    <div class="content-overlay" />
  </div>
</div>

<style>
  /*----------------------------------------
    Login Page
------------------------------------------*/
  #login-page {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    height: 100vh;
  }

  #login-page .card-panel.border-radius-6.login-card {
    margin-left: 0 !important;
  }

  @media screen and (max-width: 9000px) {
    .card-adjust {
      height: 353px !important;
    }
  }

  @media screen and (max-width: 1921px) {
    .card-adjust {
      height: 246.5px !important;
    }
  }

  @media screen and (max-width: 1751px) {
    .card-adjust {
      height: 216px !important;
    }
  }

  @media screen and (max-width: 1601px) {
    .card-adjust {
      height: 187.5px !important;
    }
  }

  @media screen and (max-width: 1537px) {
    .card-adjust {
      height: 178px !important;
    }
  }

  @media screen and (max-width: 1441px) {
    .card-adjust {
      height: 159px !important;
    }
  }

  @media screen and (max-width: 1281px) {
    h5 {
      font-size: 1.64rem !important;
    }
  }

  @media screen and (max-width: 1025px) {
    h5 {
      font-size: 1.2rem !important;
    }
  }

  @media screen and (max-width: 801px) {
    h5 {
      font-size: 1.15rem !important;
    }
  }

  @media screen and (max-width: 769px) {
    h5 {
      font-size: 1.1rem !important;
    }
  }

  @media screen and (max-width: 721px) {
    h5 {
      font-size: 1.05rem !important;
    }
  }

  @media screen and (max-width: 641px) {
    h5 {
      font-size: 1.04rem !important;
    }
  }

  input:-internal-autofill-selected {
    background-color: transparent !important;
  }

  label {
    margin-top: -5px;
  }
</style>

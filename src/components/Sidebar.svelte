<script>
  import {  stores } from "@sapper/app";



  const { session } = stores();

  let user = {
    user_name: "Test User",
    user_country: "all",
    user_region: "all",
    user_picture: "avatar-0.png",
    isRa: true
  };

  if ($session.user) {
    user = $session;
  }


</script>

<style>
  .sidenav li {
    line-height: 35px !important;
  }

  .divider-ns {
    height: 10px !important;
  }




.glowing-circle {
  width: 100px;
  height: 100px;
  border-radius:50%;
  background-color: #fff;
  -webkit-animation: glowing 1s ease-in-out infinite alternate;
  -moz-animation: glowing 1s ease-in-out infinite alternate;
  animation: glowing 1s ease-in-out infinite alternate;
}
@-webkit-keyframes glowing {
  from {
    box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #f0f, 0 0 40px #0ff, 0 0 50px #e60073, 0 0 60px #e60073, 0 0 70px #e60073;
  }
  to {
    box-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6, 0 0 80px #ff4da6;
  }
}
</style>

<aside
  class="sidenav-main nav-expanded nav-lock nav-collapsible sidenav-light
  sidenav-active-square" style="border-radius: 0px;
  background: linear-gradient(145deg, #ffffff, #dedede);
  box-shadow:  5px 5px 10px #ededed,
               -5px -5px 10px #ffffff;">
  <div class="brand-sidebar">
    <h1 class="logo-wrapper">
      <a class="brand-logo darken-1" href="/profile/dashboard">
    <img class="hide-on-med-and-down" src="logo2.png" alt="logo" />

    
        <img
          class="show-on-medium-and-down hide-on-med-and-up"
          src="logo2.png"
          alt="logo" />
       

        <span class="logo-text hide-on-med-and-down blue-text" >
          ALGEDONIC
        </span>
      </a>

    </h1>
  </div>

  <ul
    class="sidenav sidenav-collapsible leftside-navigation collapsible
    sidenav-fixed menu-shadow"
    id="slide-out"
    data-menu="menu-navigation"
    data-collapsible="menu-accordion"
    style="border-radius: 0px;
    background: linear-gradient(145deg, #ffffff, #dedede);
    box-shadow:  5px 5px 10px #ededed,
                 -5px -5px 10px #ffffff;">

    <li class="navigation-header">
      <small style="font-size: 0.5rem;">
        Logged as
        <b>
          {#if $session.user}
           Test User
          {:else}None{/if}
      
        </b>

      </small>

    </li>

    <li class="navigation-header">
      <a href="javascript:void(0);" class="navigation-header-text">
        Menu
      </a>
      <i class="navigation-header-icon material-icons">more_horiz</i>
    </li>

    


    <li class="bold">
      <a
        class="waves-effect waves-grey "
        class:active={$session.current_page == 'moods'}
        rel="prefetch"
        href="/moods">
        <i class="material-icons">dashboard</i>
        <span class="menu-title" data-i18n="User Profile"><b>1.</b> Moods</span>
      </a>

    </li>

    <li class="bold">
      <a
        class="waves-effect waves-grey 
        "
        class:active={$session.current_page == 'pains'}
        href="/pains">
        <i class="material-icons">account_circle</i>
        <span class="menu-title">2. Pain Points</span>
      </a>

    </li>

    <li class="bold">
      <a
        class="waves-effect waves-grey disabled
        "
        class:active={$session.current_page == 'limits'}
        href="/">
        <i class="material-icons">av_timer</i>
        <span class="menu-title">3. Limitations (todo)</span>
      </a>

    </li>

    <li class="bold">
      <a disabled
        class="waves-effect waves-grey disabled
        "
        class:active={$session.current_page == 'opportunities'}
        href="/moods">
        <i class="material-icons">check_circle</i>
        <span class="menu-title">4. Opportunities (todo)</span>
      </a>

    </li>

    <li class="bold">
      <a disabled
        class="waves-effect waves-grey disabled
        "
        class:active={$session.current_page == 'actions'}
        href="/moods">
        <i class="material-icons">assignment_ind</i>
        <span class="menu-title">5. Community Action (todo)</span>
      </a>

    </li>






  

  



   
    <li class="navigation-header"  style="margin-top: 150px">
      <span>Average Community Mood:</span>
      <div class="glowing-circle" style="margin-top: 45px !important; margin-left: 55px;"></div>
    </li>

 

  </ul>
  <div class="navigation-background" />
  <a
    class="sidenav-trigger btn-sidenav-toggle btn-floating btn-medium
    waves-effect waves-light hide-on-large-only"
    href="javascript:void(0);"
    data-target="slide-out">
    <i class="material-icons">menu</i>
  </a>
</aside>

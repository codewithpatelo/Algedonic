<script context="module">
  export async function preload(page, session) {
    try {
      const user = session.user;
    } catch (err) {
      throw err;
    }
  }
</script>

<script>
  import { goto, stores } from "@sapper/app";
  const { page, session } = stores();
  import { post } from "@connections/utils.js";
  import AutoComplete from "@simple-svelte-autocomplete/src/SimpleAutocomplete.svelte";
  import { slide } from "svelte/transition";

  import { onMount } from "svelte";

  import * as api from "@utils/BarometerConnection";
  import { get_users } from "../components/get_data.js";

  let password;

  // AUTOCOMPLETE DATA
  let selected_user;
  let selected_user_key;

  let user_list;

  get_users().then(function(result) {
    user_list = result;
  });

  $session.profile_on = false;

  let user = {
    user_name: "Test User",
    user_country: "all",
    user_region: "all",
    user_picture: "avatar-0.png",
    isRa: true
  };

  if ($session.user) {
    user = $session.user;
  }

  let search_state = 0;

  let wrapper_class = "header-search-wrapper";

  function searchHandle() {
    event.preventDefault();
    if (search_state === 0) {
      search_state = 1;
      wrapper_class = "header-search-wrapper-focus";
    } else {
      wrapper_class = "header-search-wrapper";
    }
  }

  let notifications_on = false;

  function collapse_notifications() {
    if ($session.notifications_on === false) {
      $session.profile_on = false;
      $session.notifications_on = true;
    } else {
      $session.notifications_on = false;
    }
  }

  let connectivity_status = "avatar-online";

  async function refresh() {
    try {
    } catch (err) {
      throw err;
    }
    try {
      user = $session.user;

      const response = "await post(`auth/login`, { user, password })";

      if (response.user) {
        $session.user = response.user;
        connectivity_status = "avatar-online";
      }
    } catch (err) {
      throw err;
    }
  }

  let my;
  let mx;
  let is_online;

  onMount(refresh);

  function notify_delete() {
    $session.notifications_on = false;
    $session.profile_on = false;
  }

  let profile_on = false;
  function collapse_profile() {
    console.log($session.profile_on);
    if ($session.profile_on === false) {
      $session.notifications_on = false;
      $session.profile_on = true;
    } else {
      $session.profile_on = false;
    }
  }

  function reset_dropdowns() {
    $session.notifications_on = false;
    $session.profile_on = false;
  }

  let notification_over = true;
  let notification_icon_over = true;

  function notification_mouseover() {
    notification_over = true;
    console.log("notification over is " + notification_over);
  }

  function notification_mouseout() {
    notification_over = false;
    console.log("notification over is " + notification_over);
  }

  function notification_icon_mouseover() {
    notification_icon_over = true;
    console.log("notification over is " + notification_icon_over);
  }

  function notification_icon_mouseout() {
    notification_icon_over = false;
    console.log("notification over is " + notification_icon_over);
  }

  function profile_mouseover() {
    profile_over = true;
  }

  function profile_mouseout() {
    profile_over = false;
  }

  function profile_icon_mouseover() {
    profile_icon_over = true;
  }

  function profile_icon_mouseout() {
    profile_icon_over = false;
  }

  function decollapse_notifications() {
    notifications_on = false;
    console.log("notifications on is " + notifications_on);
  }

  function decollapse_profile() {
    profile_on = false;
    console.log("notifications on is " + profile_on);
  }

  function handleKeydown(event) {}

  function handleKeyup(event) {}

  function logout(event) {
    reset_dropdowns();

    goto("/auth/login");
  }
</script>

<svelte:window
  bind:scrollY={my}
  bind:scrollX={mx}
  on:keydown={handleKeydown}
  on:keyup={handleKeyup}
/>

<header class="page-topbar" id="header">
  <div class="navbar navbar-fixed">
    <nav
      class="navbar-main navbar-color nav-collapsible sideNav-lock navbar-light
      white"
      style=""
    >
      <div
        class="nav-wrapper"
        style="border-radius: 0px; background: #ffffff; box-shadow: 5px 5px 10px
        #9c9c9c, -5px -5px 10px #ffffff;"
      >
        <div class="{wrapper_class} hide-on-med-and-down">
          <i class="material-icons">search</i>

          {#await user_list}
            <p>Loading Users...</p>
            <div class="progress">
              <div class="indeterminate" />
            </div>
          {:then user_list}

            <AutoComplete
              items={user_list}
              bind:selectedItem={selected_user}
              bind:value={selected_user_key}
              labelFieldName="location_company_name"
              valueFieldName="id"
              placeholder="Search for people who might feel just like me..."
              on:click={searchHandle}
              on:change={searchHandle}
              maxItemsToShowInList="6"
              keywordsFunction={userBaro => userBaro.id + ' ' + userBaro.name + ' ' + userBaro.name}
              class="header-search-input z-depth-2 autocomplete"
            />

          {:catch error}
            <AutoComplete
              class="header-search-input z-depth-2 autocomplete disabled"
            />
          {/await}

          <!--
          <input
            id="search_autocomplete"
            class="header-search-input z-depth-2 autocomplete"
            type="search"
            name="Search"
            placeholder="Search for requests by company name..."
            data-search="template-list"
            bind:value={search_query}
            on:click={searchHandle} />
            -->
          <ul class="search-list collection display-none" />
        </div>
        <ul class="navbar-list right">
          <li class="hide-on-large-only search-input-wrapper">
            <a
              class="waves-effect waves-block waves-light search-button"
              href="javascript:void(0);"
            >
              <i class="material-icons">search</i>
            </a>
          </li>

          <li>
            <a
              class="waves-effect waves-block waves-light notification-button"
              href="javascript:void(0);"
              on:click={collapse_notifications}
              on:load={refresh}
            >

              <i class="material-icons">
                notifications_none
                {#if $session.todo}
                  {#if $session.todo.length != 0}
                    <small class="notification-badge">
                      {$session.todo.length}
                    </small>
                  {/if}
                {/if}

              </i>

            </a>
          </li>

          <li>
            <a
              class="waves-effect waves-block waves-light "
              href="javascript:void(0);"
              on:click={collapse_profile}
            >
              <span class="avatar-status {connectivity_status}">
  
        
                  <img src="avatar-0.png" alt="avatar" />
          
                <i />
              </span>
            </a>
          </li>

        </ul>

        <!-- notifications-dropdown-->

        {#if $session.notifications_on}
          <ul
            class="dropdown-menu dropdown-menu-left"
            id="notifications-dropdown"
            transition:slide
          >

            <li class="notifications-item" style=" padding-right: 140px; ">
              <h7>
                NOTIFICATIONS
                {#if $session.todo && $session.todo.length != 0}
                  <span class="new badge" data-badge-caption="new">
                    {$session.todo.length}
                  </span>
                {/if}

              </h7>
            </li>

            {#if !$session.todo || $session.todo.length == 0}
              <li class="notifications-item" style=" padding-right: 140px; ">

                <a
                  class="grey-text text-darken-1"
                  on:click={reset_dropdowns}
                  href="javascript:void(0);"
                >
                  <i class="material-icons">info</i>
                  <small>No notifications</small>
                </a>
                <!--<time
                class="media-meta grey-text darken-2"
                datetime="2015-06-12T20:50:48+08:00"
              >
                2 hours ago
              </time>-->
              </li>
            {:else if $session.todo}
              {#each $session.todo as notification}
                <li class="notifications-item" style=" padding-right: 140px; ">
                  <a
                    class="grey-text text-darken-1"
                    on:click={notify_delete}
                    href="/request/{notification.request_key}"
                  >
                    <i class="material-icons">info</i>

                    <small>{notification.text}</small>
                  </a>
                  <!--<time
                class="media-meta grey-text darken-2"
                datetime="2015-06-12T20:50:48+08:00"
              >
                2 hours ago
              </time>-->
                </li>
              {/each}
            {/if}

          </ul>
        {/if}

        <!-- profile-dropdown-->
        {#if $session.profile_on}
          <ul
            class="dropdown-menu dropdown-menu-left"
            id="profile-dropdown"
            transition:slide
            style="width: 130px !important;"
          >

            <li class="divider" />
            <li>
              <a
                class="grey-text text-darken-1"
                href="javascript:void(0);"
                on:click={logout}
                style="font-size: 0.8em; line-height: 3em; height: 2em;
                padding-left: 2em !important;"
              >
                <i
                  class="material-icons"
                  style="font-size: 1.5em; line-height: 1em;"
                >
                  keyboard_tab
                </i>
                Logout
              </a>
            </li>
          </ul>
        {/if}
      </div>
      <nav class="display-none search-sm">
        <div class="nav-wrapper">
          <form id="navbarForm">
            <div class="input-field search-input-sm">
              <input
                class="search-box-sm mb-0"
                type="search"
                required=""
                id="search"
                placeholder="Search"
                data-search="template-list"
                on:click={searchHandle}
              />
              <label class="label-icon" for="search">
                <i class="material-icons search-sm-icon">search</i>
              </label>
              <i class="material-icons search-sm-close">close</i>
              <ul class="search-list collection search-list-sm display-none" />
            </div>
          </form>
        </div>
      </nav>
    </nav>
  </div>
</header>

<style>
  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    float: left;
    min-width: 6rem;
    padding: 0.5rem 0;
    margin: 0.125rem 0 0;
    font-size: 1rem;
    color: #212529;
    text-align: left;
    list-style: none;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.25rem;
  }

  .dropdown-menu-left {
    right: 0;
    left: auto;
  }

  .notifications-item {
    padding-right: 140px;
  }
</style>

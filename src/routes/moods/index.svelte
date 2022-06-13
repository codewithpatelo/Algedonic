<script context="module">
    import * as api from "@utils/BarometerConnection.mjs";
</script>

<script>

import moment from "moment";
import { stores } from "@sapper/app";

    const { session } = stores();

    $session.current_page = "moods";
   
    $: moods = api.get(`mood`);
</script>

<div />

<div class="row">

    <div class="content-wrapper-before" />
    <div class="breadcrumbs-light pb-0 pt-4" id="breadcrumbs-wrapper">
        <div class="container">

            <div class="row">
                <div class="col s10 m6 l6">
                    <h5 class="breadcrumbs-title mt-0 mb-0">
                        <span>How is our community feeling?</span>
                    </h5>

                </div>
                <div class="row right" />
            </div>
        </div>
    </div>
    <!-- END WRAPPER -->

    <div class="col s12">

        <div class="container">

            <div class="section section-data-tables">

                {#await moods}
                    Loading moods...
                {:then ms}
                    {#each ms as m, i}
                        {#if m.label == 'desolate'}
                            <div class="card-alert card red lighten-5">

                                <div class="card-content red-text">
                                    <div class="row">
                                        <div class="col m4">
                                            <div
                                                class="chip
                                                gradient-45deg-purple-deep-orange
                                                white-text"
                                            >
                                                <img
                                                    src="avatar-8.png"
                                                    alt="ava"
                                                />
                                                {m.label}
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <div class="chip">
                                                ({moment(m.updatedAt).format('DD/MM/YYYY HH:mm:ss')})
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <img
                                                src="state1.png"
                                                style="width: 64px; height:
                                                64px;"
                                                alt="state"
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <!-- END CARD -->
                        {:else if m.label == 'dispirited' || m.label == 'hysterical'}
                            <div class="card-alert card orange lighten-5">

                                <div class="card-content orange-text">
                                    <div class="row">
                                        <div class="col m4">
                                            <div
                                                class="chip
                                                gradient-45deg-purple-deep-orange
                                                white-text"
                                            >
                                                <img
                                                    src="avatar-8.png"
                                                    alt="ava"
                                                />
                                                {m.label}
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <div class="chip">
                                                ({moment(m.updatedAt).format('DD/MM/YYYY HH:mm:ss')})
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <img
                                                src="state2.png"
                                                style="width: 64px; height:
                                                64px;"
                                                alt="state"
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <!-- END CARD -->
                        {:else if m.label == 'dispirited' || m.label == 'sad'}
                            <div class="card-alert card orange lighten-5">

                                <div class="card-content orange-text">
                                    <div class="row">
                                        <div class="col m4">
                                            <div
                                                class="chip
                                                gradient-45deg-purple-deep-orange
                                                white-text"
                                            >
                                                <img
                                                    src="avatar-8.png"
                                                    alt="ava"
                                                />
                                                {m.label}
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <div class="chip">
                                                ({moment(m.updatedAt).format('DD/MM/YYYY HH:mm:ss')})
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <img
                                                src="state2.png"
                                                style="width: 64px; height:
                                                64px;"
                                                alt="state"
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <!-- END CARD -->
                        {:else if m.label == 'quiet' || m.label == 'ok'}
                            <div class="card-alert card yellow lighten-5">

                                <div class="card-content yellow-text">
                                    <div class="row">
                                        <div class="col m4">
                                            <div
                                                class="chip
                                                gradient-45deg-purple-deep-orange
                                                white-text"
                                            >
                                                <img
                                                    src="avatar-8.png"
                                                    alt="ava"
                                                />
                                                {m.label}
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <div class="chip">
                                                ({moment(m.updatedAt).format('DD/MM/YYYY HH:mm:ss')})
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <img
                                                src="state3.png"
                                                style="width: 64px; height:
                                                64px;"
                                                alt="state"
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <!-- END CARD -->
                        {:else if m.label == 'energized'}
                            <div class="card-alert card green lighten-5">

                                <div class="card-content green-text">
                                    <div class="row">
                                        <div class="col m4">
                                            <div class="chip cyan white-text">
                                                <img
                                                    src="avatar-8.png"
                                                    alt="ava"
                                                />
                                                {m.label}
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <div class="chip">
                                                ({moment(m.updatedAt).format('DD/MM/YYYY HH:mm:ss')})
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <img
                                                src="state4.png"
                                                style="width: 64px; height:
                                                64px;"
                                                alt="state"
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <!-- END CARD -->
                        {:else if m.label == 'lively'}
                            <div class="card-alert card green lighten-4">

                                <div class="card-content green-text">
                                    <div class="row">
                                        <div class="col m4">
                                            <div class="chip cyan white-text">
                                                <img
                                                    src="avatar-8.png"
                                                    alt="ava"
                                                />
                                                {m.label}
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <div class="chip">
                                                ({moment(m.updatedAt).format('DD/MM/YYYY HH:mm:ss')})
                                            </div>
                                        </div>
                                        <div class="col m4">
                                            <img
                                                src="state5.png"
                                                style="width: 64px; height:
                                                64px;"
                                                alt="state"
                                            />
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <!-- END CARD -->
                        {/if}
                    {/each}
                {:catch err}
                    Problem with moods
                {/await}

            </div>

        </div>

    </div>

</div>

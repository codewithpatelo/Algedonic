

<script>

import { stores } from "@sapper/app";

const { session } = stores();

$session.current_page = "pains";

   const items = [
    'When I get to see I cannot pay rent I feel desesperated.', 'I feel really awful when I cannot take time for myself.']
   
</script>

<div />

<div class="row">

    <div class="content-wrapper-before" />
    <div class="breadcrumbs-light pb-0 pt-4" id="breadcrumbs-wrapper">
        <div class="container">

            <div class="row">
                <div class="col s10 m6 l6">
                    <h5 class="breadcrumbs-title mt-0 mb-0">
                        <span>What could be triggering what we feel?</span>
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

               
                    {#each items as m, i}
                     
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
                                                {m}
                                            </div>
                                        </div>
                                     
                                     

                                    </div>
                                </div>
                            </div>
                            <!-- END CARD -->
                     
                    {/each}
               

            </div>

        </div>

    </div>

</div>

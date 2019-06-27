<template>
    <div>
        <div class="md-layout ">
            <md-card class="md-layout-item md-small-size-100 md-size-30">
                <md-card-header>
                    <md-card-header-text>
                        <md-avatar class="md-medium" style="display: inline-block">
                            <img :src="profilePicture"/>
                        </md-avatar>
                        <div style="display: inline-block">
                            <span class="md-subheading">{{$cookies.get("username")}}</span><br>
                            <span class="md-caption">Last signed in: {{$cookies.get("last-signed-in")}}</span>
                        </div>
                    </md-card-header-text>
                </md-card-header>
            </md-card>
            <md-card class="md-layout-item md-small-size-100">
                <md-card-header>
                    <md-card-header-text>
                        <div style="display: inline-block; padding-top: .5em">
                            <md-icon>
                                edit
                            </md-icon>&nbsp;
                            <span class="md-subheading">{{parseInt($cookies.get("article-count")) > 0? $cookies.get("article-count") : "No"}} Article{{ parseInt($cookies.get("article-count")) == 1? "" : "s"}}</span>
                        </div>
                    </md-card-header-text>
                </md-card-header>
            </md-card>
            <md-card class="md-layout-item md-small-size-100">
                <md-card-header>
                    <md-card-header-text>
                        <div style="display: inline-block; padding-top: .5em">
                            <md-icon>
                                event
                            </md-icon>&nbsp;
                            <span class="md-subheading">{{eventCount > 0? eventCount : "No"}} Event{{ eventCount == 1? "" : "s"}}</span>
                        </div>
                    </md-card-header-text>
                </md-card-header>
            </md-card>
            <md-card class="md-layout-item md-small-size-100">
                <md-card-header>
                    <md-card-header-text>
                        <div style="display: inline-block; padding-top: .5em">
                            <md-icon>
                                collections
                            </md-icon>&nbsp;
                            <span class="md-subheading">{{galleryCount > 0? galleryCount : "No"}} Gallery Image{{galleryCount== 1? "" : "s"}}</span>
                        </div>
                    </md-card-header-text>
                </md-card-header>
            </md-card>
        </div>
        <br>
        <div class="md-layout ">
            <accounts class="md-layout-item md-small-size-100 md-size-30" style="margin-bottom: 1em"/>
            <categories-and-tags class="md-layout-item md-small-size-100" style="margin-bottom: 1em"/>
        </div>
        <br>
        <div class="md-layout ">
            <gallery @change="galleryCount = $event" class="md-layout-item md-small-size-100" style="margin-bottom: 1em"/>
            <events @change="eventCount = $event" class="md-layout-item md-small-size-100 md-size-40" style="margin-bottom: 1em"/>
        </div>
        <br>
        <mailer class="md-layout-item md-small-size-100 "/>
    </div>
</template>

<script>
import Accounts from "./Accounts.vue";
import CategoriesAndTags from "./CategoriesAndTags.vue";
import Mailer from "./Mailer.vue";
import Gallery from "./Gallery.vue";
import Events from "./Events.vue";

export default {
    data(){
        return {
            profilePicture: Vue.prototype.profilePicture,
            galleryCount: parseInt(this.$cookies.get("gallery-count")) || 0,
            eventCount: parseInt(this.$cookies.get("event-count")) || 0,
        }
    },
    components: {
        Accounts,
        CategoriesAndTags,
        Mailer,
        Gallery,
        Events
    },
}
</script>
<template>
    <div>
        <v-tabs dense v-model="tab">
            <v-tab href="#Admin" :to="{name: 'admin'}">Admin</v-tab>
            <v-tab href="#Events" :to="{name: 'events'}">Events</v-tab>
            <v-tab href="#Gallery" :to="{name: 'gallery'}">Gallery</v-tab>
        </v-tabs>
        <router-view/>
    </div>
</template>
<script>
export default {
    data(){
        return {
            tab: ""
        }
    }
}
</script>

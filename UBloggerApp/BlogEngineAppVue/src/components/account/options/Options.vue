
<template>
    <v-container grid-list-xl fluid>
        <v-layout wrap>
            <v-flex xs12 sm6 md4 v-if="$vuetify.breakpoint.smAndUp || !showSettings">
                <v-card>
                    <v-list>
                        <v-list-tile @click="component = item.component; showSettings = true" :class="{'primary--text': component == item.component && $vuetify.breakpoint.smAndUp,  'v-list__tile--active': component == item.component && $vuetify.breakpoint.smAndUp}" v-for="(item, index) in options" :key="index" v-bind="item.attrs">
                            <v-list-tile-action>
                                <v-icon>{{item.icon}}</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-text>{{item.name}}</v-list-tile-text>
                            </v-list-tile-content>
                        </v-list-tile>
                        <v-list-tile @click="toggleTheme">
                            <v-list-tile-action>
                                <v-icon>color_lens</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-text>Toggle Theme</v-list-tile-text>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </v-card>
            </v-flex>
            <v-flex v-if="$vuetify.breakpoint.smAndUp || showSettings">
                <v-btn icon v-if="$vuetify.breakpoint.xs" @click="showSettings = false">
                    <v-icon>keyboard_backspace</v-icon>
                </v-btn>
                <span v-if="$vuetify.breakpoint.xs">{{this.options.filter(e => e.component == component)[0].name}}</span>
                <component :is="component" />
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
export default {
    data(){
        return {
            component: "profile-settings",
            showSettings: false,
            options: [
                {
                    name: "Profile Settings",
                    icon: "account_circle",
                    component: "profile-settings"
                    
                },
                {
                    name: "Password Settings",
                    icon: "lock_outline",
                    component: "password-settings"
                }
            ]
        }
    },
    methods: Object.assign({}, 
    Vuex.mapMutations([
        "toggleTheme"
    ]))
}
</script>

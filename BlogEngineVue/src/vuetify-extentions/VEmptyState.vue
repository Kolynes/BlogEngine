<template>
    <v-container v-bind="$attrs" align-center>
        <center>
            <v-icon :style="{fontSize: iconSize}" class="icon" :color="iconColor" v-if="icon">{{icon}}</v-icon>
            <p class="title font-weight-bold" :class="{'white--text': dark, 'black--text': light}" v-if="title">{{title}}</p>
            <p class="subheading" v-if="description" :class="{'white--text': dark, 'black--text': light}">{{description}}</p>
            <slot></slot>
        </center>
    </v-container>
</template>

<script>
export default {
    inheritAttrs: false,
    name: "VEmptyState",
    props: {
        icon: String,
        title: String,
        description: String,
        light: Boolean,
        dark: Boolean,
        iconSize: {
            type: String,
            default: "20em"
        },
        iconColor: {
            type: String,
            default: "rgba(0,0,0,0.5)"
        }
    }

}
</script>

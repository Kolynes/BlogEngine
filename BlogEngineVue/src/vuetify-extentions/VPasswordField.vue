<template>
    <v-text-field v-bind="$attrs" :value="value" @input="$emit('input', $event)" :append-icon="!visibility? 'visibility': 'visibility_off'" @click:append="visibility = !visibility" :type="!visibility? 'password': 'text'"/>
</template>

<script>
export default {
    inheritAttrs: false,
    props: {
        value: String
    },
    model: {
        prop: "value",
        event: "input"
    },
    data(){
        return {
            visibility: false
        }
    },
    watch: {
        visibility(newValue){
            this.$emit("visibility", newValue);
        }
    },
}
</script>
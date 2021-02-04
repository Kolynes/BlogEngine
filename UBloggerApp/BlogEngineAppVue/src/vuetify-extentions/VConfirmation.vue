<template>
    <v-dialog v-model="show" width="300" persistent>
        <v-dialog-content>
            <v-card :dark="dark" :light="light">
                <v-btn icon style="float:right" @click="close">
                    <v-icon>close</v-icon>
                </v-btn>
                <v-card-title>
                    <v-icon class="mr-2">info_outline</v-icon> <span>Confirmation</span>
                </v-card-title>
                <v-card-text>
                    <span>{{message}}</span>
                    <v-card-actions>
                        <v-btn color="primary" :small="small" @click="runConfirm(true)">{{yes}}</v-btn>
                        <v-btn :small="small" @click="runConfirm(false)">{{no}}</v-btn>
                    </v-card-actions>
                </v-card-text>
            </v-card>
        </v-dialog-content>
    </v-dialog>
</template>

<script>
export default {
    name: "VConfirmation",
    props: {
        dark: Boolean,
        light: Boolean,
        small: Boolean,
    },
    data(){
        return {
            show: false,
            resolve: () => null,
            reject: () => null,
            message: "",
            yes: "yes",
            no: "no"
        }
    },
    methods: {
        close(){
            this.show = false
            this.$emit("close")
            this.resolve(null)
        },
        confirm(setup = {}){
            this.message = setup.message || "Please confirm this action";
            this.yes = setup.yes || this.yes;
            this.no = setup.no || this.no;
            this.show = true;
            this.$emit("show")
            return this
        },
        then(resolve){
            this.resolve = resolve;
        },
        runConfirm(value){
            this.show = false;
            this.$emit("close")
            this.resolve(value)
        }
    },
}
</script>
<template>
    <span>
        <v-text-field v-bind="$attrs" ref="textField" prepend-icon="attach_file" readonly v-model="filenames" :append-icon="filenames.length > 0 && !hideClear? 'close' : null" @click="showFileDialog" @click:prepend="showFileDialog" @click:append="clear">
            <slot name="append-outer" slot="append-outer"/>
        </v-text-field>
        <input type="file" ref="fileField" hidden @change="onFileChange" :multiple="multiple" :accept="accept"/>
    </span>
</template>

<script>
export default {
    inheritAttrs: false,
    props: {
        multiple: Boolean,
        accept: String,
        rules: Array,
        hideClear: {
            type: Boolean,
            default: false
        }
    },
    data(){
        return {
            fileList: []
        }
    },
    methods: {
        showFileDialog(){
            this.$refs.fileField.click()
        },
        clear(){
            this.filenames = []
            this.$emit("change", this.fileList)
            this.$refs.textField.blur()
        },
        onFileChange(event){
            this.fileList = event.target.files
            this.$forceUpdate()
            this.$emit("change", this.fileList)
        },
    },
    computed: {
        filenames: {
            set(value){
               this.fileList = value
            },
            get(){
                var names = [];
                for(var i = 0; i < this.fileList.length; i++){
                    names.push(this.fileList[i].name)
                }
                return names.join(", ")
            }
        }
    }
}
</script>

<style>

</style>

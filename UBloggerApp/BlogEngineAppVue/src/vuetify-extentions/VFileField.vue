<template>
    <span>
        <v-text-field v-bind="$attrs" ref="textField" prepend-icon="attach_file" readonly v-model="filenames" :append-icon="filenames.length > 0 && !hideClear? 'close' : null" @click="showFileDialog" @click:prepend="showFileDialog" @click:append="clear" :color="color">
            <slot name="append-outer" slot="append-outer"/>
        </v-text-field>
    </span>
</template>

<script>
export default {
    name: "VFileField",
    inheritAttrs: false,
    props: {
        multiple: Boolean,
        accept: String,
        rules: Array,
        hideClear: {
            type: Boolean,
            default: false
        },
        color: String
    },
    data(){
        return {
            fileList: [],
            fileField: null
        }
    },
    methods: {
        showFileDialog(){
            this.fileField = document.createElement("input")
            this.fileField.type="file"
            this.fileField.multiple = this.multiple
            this.fileField.accept = this.accept
            this.fileField.click()
            this.fileField.addEventListener("change", this.onFileChange)
        },
        clear(){
            this.fileList = []
            this.$emit("change", this.fileList)
        },
        onFileChange(event){
            this.fileList = event.target.files
            this.$emit("change", this.fileList)
        },
    },
    computed: {
        filenames(){
            var names = [];
            this.fileList = this.fileList || []
            for(var i = 0; i < this.fileList.length; i++){
                names.push(this.fileList[i].name)
            }
            return names.join(", ")
        }
    }
}
</script>
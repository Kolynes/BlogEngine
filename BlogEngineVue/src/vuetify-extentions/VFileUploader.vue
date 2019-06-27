<template>
    <v-card>
        <v-card-text>
            <v-toolbar flat color="transparent">
                <v-icon>file_upload</v-icon>
                <span class="font-weight-bold ml-1">{{title}}</span>
                <v-spacer/>
                <v-btn icon @click="close" v-if="dialog">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-form ref="uploadForm" @submit.prevent="upload">
                <v-file-field :multiple="multiple" ref="fileField" :hide-clear="uploading" @change="onFileChange" :error-messages="errorMessages" :label="`Choose file${multiple? '(s)': ''}`" :accept="accept">
                    <v-progress-circular slot="append-outer" :value="percentage" width="2" size="40" v-if="uploading">
                        <span class="caption">{{percentage}}%</span>
                    </v-progress-circular>
                </v-file-field>
                <span class='caption' v-show="files.length > 0">{{files.length}} {{" file" + (files.length > 1? "s" : "")}} ({{fileSize}})</span>
                <v-card-actions>
                    <v-btn round icon color="primary" type="submit" :loading="uploading && percentage != 100">
                        <v-icon>file_upload</v-icon>
                    </v-btn>
                    <v-spacer/>
                    <v-btn round icon color="secondary" v-if="uploading && percentage != 100" @click="cancel">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            default: "File Upload"
        },
        dialog: Boolean,
        url: String,
        multiple: Boolean,
        filename: String,
        accept: String,
        rules: {
            type: Array,
            default: []
        }
    },
    data(){
        return{
            files: [],
            xhr: this.$http.createXHR(),
            uploading: false,
            percentage: 0,
            fileSize: "",
            errorMessages: []
        }
    },
    methods: {
        onFileChange(fileList){
            this.errorMessages = []
            this.files = fileList;
            var size = 0;
            for(var file = 0; file < this.files.length; file++){
                size += this.files[file].size
            }
            var sizes = ["B", "KB", "MB", "GB", "TB"]
            for(var i in sizes){
                if(size/1024  >= 1){
                    size /= 1024
                } 
                else if(size/1024 < 1){
                    break
                }
            }
            this.fileSize = Math.round(size) + sizes[i];
        },
        upload(){
            for(var rule of this.rules){
                var temp = rule(this.files)
                if(temp !== true){
                    this.errorMessages.push(temp)
                }
            }
            if(this.errorMessages.length > 0){
                return
            }
            else{
                var data = new FormData();
                for(var file = 0; file < this.files.length; file++){
                    data.append(this.computedFilename || this.files[file].name, this.files[file])
                }
                this.xhr.open("POST", this.url);
                this.xhr.setRequestHeader("X-CSRF-TOKEN", this.$csrftoken || "");
                this.xhr.upload.onprogress = (e) => {
                    this.percentage = Math.round(e.loaded/e.total*100);
                    if(this.percentage == 100){
                        setTimeout(() => {
                            this.$emit("done")
                            this.uploading = false;
                            this.$refs.fileField.clear()
                        }, 5000);
                    }
                };
                this.xhr.send(data)
                this.xhr.timeout = 10000
                this.xhr.ontimeout = () => {
                    this.$emit("fail", "The connection timed out. Please try again.")
                    this.uploading = false
                }
                this.xhr.onload = () => this.$emit("uploaded")
                this.uploading = true;
            }
        },
        close(){
            this.xhr.abort();
            this.uploading = false;
            this.files = [];
            this.$emit("close")
        },
        cancel(){
            this.uploading = false;
            this.xhr.abort()
        }
    },
    computed: {
        computedFilename(){
            return this.multiple?  null : this.filename
        }
    },
    destroyed(){
        this.files = []
    }
}
</script>

<style lang="scss">
    #close{
        float: right;
    }
</style>

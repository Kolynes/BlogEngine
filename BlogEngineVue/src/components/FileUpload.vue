<template>
    <md-dialog :md-active.sync="showUploadDialog" md-backdrop-class="higher-overlay" :md-click-outside-to-close="false" :md-fullscreen="false" >
        <md-dialog-title>
            <md-icon>file_upload</md-icon>
            <span> Upload</span>
            <md-button class="md-icon-button" id="close" @click="close">
                <md-icon>close</md-icon>
            </md-button>
        </md-dialog-title>
        <md-dialog-content>
            <form @submit.prevent="upload">
                <md-field>
                    <md-file type="file" :multiple="multiple" @md-change="onFileChange" :placeholder="'Choose file' + (multiple? '(s)': '')" required :accept="`${accept}/*`"/>
                </md-field>
                <span class='md-caption' v-show="this.files.length">{{this.files.length}} {{" file" + (this.files.length > 1? "s" : "")}} ({{fileSize}})</span>
                <div style="height: 1.5em">
                    <span v-if="uploading">
                        <span v-if="percentage == 100">Upload Complete</span><span v-else>Uploading... ({{percentage}}%)</span><br>
                        <md-progress-bar :md-value="percentage"/>
                    </span>
                </div>
                <md-dialog-actions>
                    <md-button class="md-primary md-raised" type="submit" v-if="!uploading">
                        <md-icon>file_upload</md-icon>
                        <span>Upload</span>
                    </md-button>
                    <md-button class="md-primary md-raised" v-if="uploading && percentage != 100" @click="cancel">
                        <md-icon>close</md-icon>
                        <span>Cancel</span>
                    </md-button>
                </md-dialog-actions>
            </form>
        </md-dialog-content>
    </md-dialog>
</template>

<script>
export default {
    props: {
        showUploadDialog: Boolean,
        url: String,
        multiple: Boolean,
        accept: String
    },
    data(){
        return{
            files: [],
            xhr: this.$http.createXHR(),
            uploading: false,
            percentage: 0,
            fileSize: ""
        }
    },
    methods: {
        onFileChange(fileList){
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
            var data = new FormData();
            for(var file = 0; file < this.files.length; file++){
                data.append(this.files[file].name, this.files[file])
            }
            this.xhr.open("POST", this.url);
            this.xhr.setRequestHeader("X-CSRFToken", this.$cookies.get("csrftoken"));
            this.xhr.upload.onprogress = (e) => {
                this.percentage = Math.round(e.loaded/e.total*100);
                if(this.percentage == 100){
                    setTimeout(() => {
                        this.uploading = false;
                        this.fileField = ""
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

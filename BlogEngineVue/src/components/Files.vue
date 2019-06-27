<template>
    <div>
        <div>
             <md-toolbar class="md-primary">
                <div class="md-toolbar-row">
                    <md-button class="md-icon-button" :disabled="currentWorkingDirectory == 'root/'" @click="gotoParentDirectory"  v-if="!startSearch && !selectingMode">
                        <md-icon>keyboard_backspace</md-icon>
                    </md-button>
                    <div class="md-toolbar-section-start cwd"  style="overflow-x: auto" v-if="!selectingMode || interfaced">
                        <span class="md-subheading" v-if="!startSearch">{{currentWorkingDirectory}}</span>
                    </div>
                    <div class="md-toolbar-section-start" v-else>
                        <span class="md-subheading">{{selectedItems}}</span>
                    </div>
                    <div class="md-toolbar-section-end" v-if="!selectingMode">
                        <template v-if="!copyingOrMoving">
                            <md-field  v-if="startSearch" md-clearable md-theme="md-primary">
                                <md-input v-model="searchString" placeholder="Search for files" style="background: rgba(0,0,0,.1); padding: 10px; border-radius: 10px"/>
                            </md-field>
                            <md-button class="md-icon-button" @click="showNewDirectoryDialog = true" v-if="!startSearch">
                                <md-icon>create_new_folder</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="showUploadDialog = true" v-if="!startSearch">
                                <md-icon>file_upload</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" id="refresh" :class="{reloading}" @click="reloadFiles" v-if="!startSearch">
                                <md-icon>refresh</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="startSearch = !startSearch; searchString = '';">
                                <md-icon v-if="!startSearch">search</md-icon>
                                <md-icon v-else>cancel</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="changeFormat" v-if="!startSearch">
                                <md-icon>{{format == "apps"? "list" : "apps"}}</md-icon>
                            </md-button>
                        </template>
                        <template v-else>
                            <md-button class="md-icon-button" @click="paste">
                                <md-icon>content_paste</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="copyingOrMoving = false">
                                <md-icon>close</md-icon>
                            </md-button>
                        </template>
                    </div>
                    <div class="md-toolbar-section-end" v-else>
                        <md-button class="md-icon-button" v-if="selectedItems == 1 && items.filter(item => item.selected)[0].type != 'directory'" :href="download()">
                            <md-icon>file_download</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" v-if="selectedItems == 1" @click="showFileInfoDialog = true">
                            <md-icon>info</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" v-if="selectedItems == 1" @click="startRename">
                            <md-icon>edit</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" @click="copy" v-if="items.filter(item => item.selected)[0].type != 'directory'">
                            <md-icon>content_copy</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" @click="cut" v-if="items.filter(item => item.selected)[0].type != 'directory'">
                            <md-icon>content_cut</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" @click="showDeleteDialog = true">
                            <md-icon>delete</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" @click="selectAll">
                            <md-icon>select_all</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" @click="cancelSelection">
                            <md-icon>close</md-icon>
                        </md-button>
                    </div>
                </div>
            </md-toolbar>
            <md-content class="md-scrollbar" id="file-system-content" :class={interfaced}>
                <div v-if="!loading">
                    <div id="search-results" v-if="searchString">
                        <md-list v-if="!noResult" class="md-double-line">
                            <md-content v-for="item in searchResults" :key="item.pk">  
                                <md-list-item md-dense @click="clearSelectionTimeoutAndOpenItem(item)">
                                    <md-avatar class="md-medium">
                                        <md-icon>{{getMaterialIcon(item.type)}}</md-icon>
                                    </md-avatar>
                                    <div class="md-list-item-text">
                                        <span>{{item.name}}</span>
                                        <span>{{item.path}}</span>
                                    </div>
                                </md-list-item>
                                <md-divider class="md-inset"></md-divider>
                            </md-content>
                        </md-list>
                        <md-empty-state md-label="No Results" md-icon="search" :md-description="`Couldn't find anything related to '${this.searchString}'`" v-else/>
                        <div class="loading" v-if="!noResult && searchResults.length == 0">
                            <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="30" style="width:auto"/>
                        </div>
                    </div>
                    <md-list v-else-if="format == 'list'" class="md-double-line" >
                        <md-card class="md-elevation-0 item" v-for="item in items" :key="item.pk" :id="item.pk" :class="{'md-primary': item.selected}">
                            <md-list-item md-dense  @mousedown="!touchEnabled? select(item): null" @touchstart="touchEnabled = true; select(item)"  @mouseup="!touchEnabled? clearSelectionTimeoutAndOpenItem(item): null" @touchend="clearSelectionTimeoutAndOpenItem(item)">
                                <md-avatar class="md-medium">
                                    <md-icon>{{getMaterialIcon(item.type)}}</md-icon>
                                </md-avatar>
                                <div class="md-list-item-text">
                                    <span>{{item.name}}</span>
                                    <span class="md-caption">{{item.type != "directory"? size(item.size) : !interfaced? (item.items != 0? (item.items + " item" + (item.items != 1? "s" : "")) : "empty") : ""}}</span>
                                </div>
                            </md-list-item>
                            <md-divider class="md-inset"></md-divider>
                        </md-card>
                    </md-list>
                    <div v-else class="flex-display" >
                        <md-card class="md-elevation-0 item" v-for="item in items" :key="item.pk" :class="{'md-primary': item.selected}" :id="item.pk">
                            <md-ripple >
                                <center style="cursor: pointer" @mousedown="!touchEnabled? select(item): null" @touchstart="touchEnabled = true; select(item)"  @mouseup="!touchEnabled? clearSelectionTimeoutAndOpenItem(item):null" @touchend="clearSelectionTimeoutAndOpenItem(item)">
                                    <md-avatar class="md-large">
                                        <md-icon>{{getMaterialIcon(item.type)}}</md-icon>
                                    </md-avatar>
                                    <center ><span style="max-height: 3em; overflow: hidden">{{item.name}}</span> <br> <span class="md-caption">{{item.type != "directory"? size(item.size) : !interfaced? (item.items != 0? (item.items + " item" + (item.items != 1? "s" : "")) : "empty") : ""}}</span></center>
                                </center>
                            </md-ripple>
                        </md-card>
                    </div>
                </div>
                <div class="loading" v-if="loading">
                    <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="30" style="width:auto"/>
                </div>
            </md-content>
        </div>
        <md-dialog :md-active.sync="showDeleteDialog" :md-fullscreen="false">
            <md-dialog-content>
                <span>Are you sure you want to delete {{selectedItems == 1? "this file" : "these files"}}?</span>
                <md-dialog-actions>
                    <md-button class="md-primary md-raised" @click="deleteItems">Yes</md-button>
                    <md-button class="md-primary" @click="showDeleteDialog = false;">No</md-button>
                </md-dialog-actions>
            </md-dialog-content>
        </md-dialog>
        <md-dialog style="z-index:99999" md-backdrop-class="higher-overlay" :md-active.sync="showNewDirectoryDialog" :md-fullscreen="false" :md-click-outside-to-close="false">
            <md-dialog-title>
                <md-icon>create_new_folder</md-icon>
                <span class="md-title">New Folder</span>
            </md-dialog-title>
            <md-dialog-content>
                <form @submit.prevent="newDirectory">
                    <md-field :class="classes">
                        <label>Folder Name</label>
                        <md-input v-model="newDirectoryName" required/>
                    </md-field>
                    <span class="error-span">{{error}}</span>
                    <md-dialog-actions>
                        <md-button class="md-primary md-raised" v-show="!creatingNewDirectory" type="submit">Create folder</md-button>
                        <md-button  v-show="creatingNewDirectory">
                            <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                        </md-button>
                        <md-button class="md-primary" @click="showNewDirectoryDialog = false">Cancel</md-button>
                    </md-dialog-actions>
                </form>
            </md-dialog-content>
        </md-dialog>
        <md-dialog :md-active.sync="showRenameDialog" :md-fullscreen="false" :md-click-outside-to-close="false">
            <md-dialog-title>
                <md-icon>edit</md-icon>
                <span class="md-title">Rename</span>
            </md-dialog-title>
            <md-dialog-content>
                <form @submit.prevent="rename">
                    <md-field :class="classes">
                        <label>New Name</label>
                        <md-input v-model="newName" required/>
                    </md-field>
                    <span class="error-span">{{error}}</span>
                    <md-dialog-actions>
                        <md-button class="md-primary md-raised" v-show="!renaming" type="submit">rename</md-button>
                        <md-button v-show="renaming">
                            <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                        </md-button>
                        <md-button class="md-primary" @click="showRenameDialog = false">Cancel</md-button>
                    </md-dialog-actions>
                </form>
            </md-dialog-content>
        </md-dialog>
        <md-dialog :md-active.sync="showOperationDialog" :md-fullscreen="false" :md-click-outside-to-close="false" :md-close-on-esc="false">
            <md-dialog-content>
                <div style="display: flex; justify-content:flex-start; align-items: center; height: 100%">
                    <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="30" style="width:auto; margin-right: .5em"/>
                    <span>{{message}}</span>
                </div>
            </md-dialog-content>
        </md-dialog>
        <md-dialog :md-active.sync="showFileInfoDialog" :md-fullscreen="false">
            <md-dialog-title>
                <md-icon>info</md-icon>
                Information
            </md-dialog-title>
            <md-dialog-content v-if="showFileInfoDialog">
                <div>
                    <md-icon class="md-size-3x">{{getMaterialIcon(selectedItem.type)}}</md-icon> 
                    <span style="display: inline-block">{{selectedItem.name}}</span><br>
                    <span class="md-caption">
                        {{selectedItem.type != "directory"? size(selectedItem.size): selectedItem.items > 0? selectedItem.items + " item" + (selectedItem.items != 1? "s" : "") : "empty"}}<br>
                        {{(selectedItem.type != "directory"? "Uploaded on " : "Created on ") + selectedItem.uploaded}}<br>
                    </span>
                </div>
            </md-dialog-content>
        </md-dialog>
        <md-snackbar :md-active.sync="showAlert" md-position="left">{{message}}</md-snackbar>
        <file-upload style="z-index:99999" @fail="fail" md-backdrop-class="higher-overlay" multiple :accept="filter" :show-upload-dialog="showUploadDialog" @close="showUploadDialog = false" :url="`upload-files/?path=${currentWorkingDirectory}`" @uploaded="reloadFiles"/>
    </div>
</template>

<script>
import FileUpload from "./FileUpload.vue"
export default {
    props: {
        interfaced: Boolean,
        filter: String
    },
    data(){
        return{
            items: [],
            searchResults: [],
            noResult: false,
            itemsToOperateOn: [],
            selectedItems: 0,
            selectedItem:{},
            searchString: "",
            reloading: false,
            loading: false,
            copyingOrMoving: false,
            creatingNewDirectory: false,
            showUploadDialog: false,
            showDeleteDialog: false,
            showNewDirectoryDialog: false,
            showRenameDialog: false,
            showOperationDialog: false,
            showFileInfoDialog: false,
            showAlert: false,
            message: "",
            format: this.$cookies.get("format") || "apps",
            startSearch: false,
            newDirectoryName: "",
            selectingMode: false,
            selectingModeTimeout: null,
            searchTimeout: null,
            currentWorkingDirectory: "root/",
            directoryStack: [],
            error: "",
            fieldError: false,
            itemToRename: {},
            newName: "",
            renaming: false,
            touchEnabled: false 
        }
    },
    methods: {
        getMaterialIcon(type){
            if(type.includes("image")){
                return "image";                    
            }
            else if(type.includes("video")){
                return "movie";                        
            }
            else if(type.includes("audio")){
                return "audiotrack";                        
            }
            else if(type.includes("text") || type.includes("application")){
                return "description";                        
            }
            else if(type == "directory"){
                return "folder"
            }
            else{
                return "info"
            }
        },
        deleteItems(){
            this.message = "deleting files...";
            this.showDeleteDialog = false;
            this.showOperationDialog = true;
            var pks = [];
            this.items.forEach(item => {
                if(item.selected){
                    pks.push(item.pk)
                }
            })
            this.$http.request({
                url: "delete-files/", 
                method: "POST",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                content: JSON.stringify({files: pks})
            }).then(() => {
                this.showOperationDialog = false
                this.reloadFiles()
                this.cancelSelection()
                this.showAlert = true;
                this.message = "Selected files have been deleted."
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
                this.showOperationDialog = false;
            })
        },
        download(){
            return `../download/?file=${this.items.filter(item => item.selected)[0].pk}`
        },
        changeFormat(){
            this.format = this.format == "apps"? "list" : "apps";
            this.$cookies.set("format", this.format);
        },
        select(item){
            if(this.interfaced){
                return;
            }
            if(!this.startSearch){
                if(item.selected){
                    item.selected = false;
                    this.selectedItems--;
                    if(this.selectedItems == 0){
                        this.selectingMode = false
                    }
                }
                else if(!this.selectingMode){
                    this.selectingModeTimeout = setTimeout(() => {
                        item.selected = true;
                        this.selectedItems++;
                        this.selectingMode = true;
                        this.selectingModeTimeout = null;
                    }, 1000)
                }
                else{
                    item.selected = true;
                    this.selectedItems++;
                }
            }
        },
        clearSelectionTimeoutAndOpenItem(item){
            if(this.selectingModeTimeout || this.interfaced || this.startSearch){
                clearTimeout(this.selectingModeTimeout)
                if(item.type == "directory"){
                    this.startSearch = false;
                    this.searchString = "";
                    this.directoryStack.push(this.currentWorkingDirectory)
                    this.currentWorkingDirectory = `${item.path}/`
                }
                else{
                    if(this.interfaced){
                        this.$emit("file-selected", `../preview/?file=${item.pk}`)
                    }
                    else{
                        window.location = `../preview/?file=${item.pk}`
                    }
                }
            }
        },
        cancelSelection(){
            this.items.forEach(item => item.selected = false)
            this.selectedItems = 0;
            this.selectingMode = false;
        },
        selectAll(){
            this.items.forEach(item => item.selected = true)
            this.selectedItems = this.items.length
        },
        newDirectory(){
            if(!this.items.every(item => item.name != this.newDirectoryName)){
                this.error = "Name already exists"
                this.fieldError = true;
            }
            else{
                this.fieldError = false;
                this.error = ""
                this.creatingNewDirectory = true;
                this.$http.request({
                    url: "new-directory/",
                    method: "POST",
                    headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                    content: JSON.stringify({
                        name: this.newDirectoryName,
                        parent: this.currentWorkingDirectory
                    })
                }).then(response => {
                    response = response.json()
                    if(!response.result){
                        this.error = response.error
                        this.fieldError = true;
                    }
                    else{
                        this.showNewDirectoryDialog = false;
                        this.creatingNewDirectory = false;
                        this.reloadFiles()
                        this.message = "New folder created"
                        this.showAlert = true;
                    }
                }).catch(reason => {
                    if(reason == "The connection timed out. Please try again."){
                        this.message = reason;
                    }
                    else{
                        this.message = "Failed to complete request. Please try again."
                    }
                    this.showAlert = true;
                    this.creatingNewDirectory = false;
                })
            }
        },
        loadFiles(){
            this.loading = true;
            this.$http.request({
                url: `files/?path=${this.currentWorkingDirectory}`
            }).then(response => {
                response = response.json()
                this.items = response.files
                this.items = this.sortAndFilter(this.items);
                this.loading = false;
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
                this.loading = false;
            })
        },
        reloadFiles(){
            this.reloading = true;
            this.$http.request({
                url: `files/?path=${this.currentWorkingDirectory}`
            }).then(response => {
                response = response.json()
                this.items = response.files
                this.items = this.sortAndFilter(this.items);
                setTimeout(() => this.reloading = false, 1000)
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
                setTimeout(() => this.reloading = false, 1000)
            })
        },
        gotoParentDirectory(){
            this.currentWorkingDirectory = this.directoryStack.pop()
        },
        startRename(){
            this.itemToRename = this.items.filter(item => item.selected)[0]
            this.newName = this.itemToRename.name
            this.showRenameDialog = true;
        },
        rename(){
            if(!this.items.every(item => item.name != this.newName)){
                this.error = "Name already exists"
                this.fieldError = true;
            }
            else{
                this.error = ""
                this.fieldError = false;
                this.renaming = true;
                this.$http.request({
                    url: "rename/",
                    method: "POST",
                    headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                    content: JSON.stringify({
                        name: this.newName,
                        parent: this.currentWorkingDirectory,
                        item: this.itemToRename.pk
                    })
                }).then(response => {
                    response = response.json()
                    if(!response.result){
                        this.error = response.error
                        this.fieldError = true;
                    }
                    else{
                        this.showRenameDialog = false;
                        this.cancelSelection()
                        this.renaming = false;
                        this.reloadFiles()
                        this.message = this.itemToRename.type == "directory"? "Folder renamed" : "File renamed"
                        this.showAlert = true;
                    }
                }).catch(reason => {
                    if(reason == "The connection timed out. Please try again."){
                        this.message = reason;
                    }
                    else{
                        this.message = "Failed to complete request. Please try again."
                    }
                    this.showAlert = true;
                    this.renaming = false;
                })
            }
        },
        copy(){
            this.itemsToOperateOn = this.items.filter(item => item.selected);
            this.message = "copying files..."
            this.copyingOrMoving = true;
            this.cancelSelection()
        },
        cut(){
            this.itemsToOperateOn = this.items.filter(item => item.selected);
            this.copyingOrMoving = true;
            this.message = "moving files..."
            this.cancelSelection()
        },
        paste(){
            this.showOperationDialog = true
            this.$http.request({
                url: `${this.message.indexOf("moving") != -1? "move" : "copy"}-files/`,
                method: "POST",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                content: JSON.stringify({
                    items: this.itemsToOperateOn.map(item => item.pk),
                    destination: this.currentWorkingDirectory
                })
            }).then(response => {
                response = response.json()
                this.reloadFiles()
                this.showOperationDialog = false
                this.copyingOrMoving = false;
                this.message = `Files ${this.message.indexOf("moving") != -1? "moved" : "copied"} successfully`
                this.showAlert = true
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
                this.copyingOrMoving = false;
            })
        },
        sortAndFilter(items){
            items.sort((a, b) => {
                if(a.type == "directory" && b.type != "directory"){
                    return -1;
                }
                else if(b.type == "directory" && a.type != "directory"){
                    return 1;
                }
                else if(a.name.toUpperCase() < b.name.toUpperCase()){
                    return -1
                }
                return 1;
            });
            if(this.filter){
                return items.filter(item => item.type == "directory" || item.type.indexOf(this.filter) > -1)
            }
            return items
        },
        size(bytes){
            var sizes = ["B", "KB", "MB", "GB", "TB"]
            for(var i in sizes){
                if(bytes/1024  >= 1){
                    bytes /= 1024
                } 
                else if(bytes/1024 < 1){
                    break
                }
            }
            return Math.round(bytes) + sizes[i];
        },
        fail(error){
            this.message = error;
            this.showAlert = true;
        }
    },
    watch: {
        currentWorkingDirectory(){
            this.loadFiles()
        },
        showNewDirectoryDialog(newValue){
            if(!newValue){
                this.error = '';
                this.fieldError = false;
                this.newDirectoryName = ""
                this.creatingNewDirectory = false
            }
        },
        showRenameDialog(newValue){
            if(!newValue){
                this.fieldError = false;
                this.error = '';
                this.renaming = false
            }
        },
        showFileInfoDialog(newValue){
            if(newValue){
                this.items.forEach(item => {
                    if(item.selected){
                        this.selectedItem = item;
                    }
                })
            }
        },
        searchString(newValue){
            if(this.searchTimeout){
                clearTimeout(this.searchTimeout);
                this.searchTimeout = null;
            }
            if(newValue != ""){
                this.noResult = false;
                this.searchTimeout = setTimeout(() => {
                    this.searchResults = [];
                    this.$http.request({
                        url: `search-files/?q=${this.searchString.trim()}&path=${this.currentWorkingDirectory}`,
                    }).then(response => {
                        response = response.json()
                        this.searchResults = response.searchResults;
                        this.searchResults = this.sortAndFilter(this.searchResults);
                        if(response.searchResults.length == 0 ){
                            this.noResult = true;
                        } else {
                            this.noResult = false;
                        }
                    }).catch(reason => {
                        if(reason == "The connection timed out. Please try again."){
                            this.message = reason;
                        }
                        else{
                            this.message = "Failed to complete request. Please try again."
                        }
                        this.showAlert = true;
                        this.loading = false
                        this.noResult = true
                    })
                }, 500)
            }
        },
    },
    components: {
        FileUpload
    },
    mounted(){
        this.loadFiles()
    },
    computed: {
        classes(){
            return this.fieldError? "md-invalid" : null;
        },
    }
    
}
</script>

<style lang="scss">
@import "vue-material/dist/components/MdLayout/variables.scss";

.reloading {
  animation: rotateZ infinite 1s;
}
.loading {
    display: flex;
    justify-content:center;
    align-items: center;
    height: 100%;
}

#file-system-content {
  overflow-y: auto;
  height: 70vh;
  &.interfaced{
      height: auto;
  }
}
.flex-display {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start !important;
  align-content: flex-start;

  .md-card {
    width: 6.5em;
    min-height: 10em;
    overflow: visible !important;
    margin: 0.25em;
    &:not(.md-primary):hover{
        background: rgba(0,0,0,.1)
    }
    span {
      display: block;
      text-align: center;
    }
  }
}
.cwd{
    width: 67px;
    @media screen and (min-width: $md-breakpoint-xsmall){
        width: auto;
    }
}
</style>
<template>
    <md-card>
        <md-toolbar class="md-transparent md-dense md-layout" :md-elevation="0">
            <div class="md-layout-item md-xsmall-size-100" style="padding-top: 10px">
                <span class="md-subheading" > <md-icon class="md-size-2x">tag</md-icon> Categories and Tags</span>
            </div>
            <div class="md-layout-item md-xsmall-size-100">
                <md-field  md-clearable >
                    <label>Search for a {{option}}</label>
                    <md-input v-model="searchString"/>
                <md-button v-if="!searchString" class="md-icon-button md-primary" @click="showCreateDialog = true">
                    <md-icon>add</md-icon>
                </md-button>
                </md-field>
            </div>
        </md-toolbar>

        <md-card-content style="height: 23em; padding-top:0;">
            <md-tabs md-theme="night-time">
                <md-tab md-label="Categories" @click="option = 'category'">
                </md-tab>
                <md-tab md-label="Tags" @click="option = 'tag'">
                </md-tab>
            </md-tabs>
            <div style=" height: 23em; overflow-y: auto" class="md-scrollbar">
                <md-list style="background: transparent;" >
                    <template v-for="item in items">
                        <md-list-item class="md-hover" :key="item.name">
                            <div class="md-list-item-text">
                                <span>{{item.name}}</span>
                                <span class="md-caption">{{item.articles? item.articles: "No"}} article{{item.articles != 1? "s" : ""}}</span>
                            </div>
                            <md-button class="md-icon-button" v-if="item.name != 'Others'" @click="itemToOperateOn = item; newName = item.name; showRenameDialog = true">
                                <md-icon>edit</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" v-if="item.name != 'Others'" @click="itemToOperateOn = item; showDeleteDialog = true">
                                <md-icon>delete</md-icon>
                            </md-button>
                        </md-list-item>
                        <md-divider :key="item.pk"></md-divider>
                    </template>
                </md-list>
                <center v-if="loading">
                    <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="30" style="width:auto;"/>
                </center>
                <md-empty-state v-if="!items.length && searchString && !loading" md-label="No Results" md-icon="search" :md-description="`Could'nt find anything related to '${searchString}'`"/>
                <md-empty-state v-if="!items.length && !searchString && !loading" :md-label="'No ' + (option == 'category'? 'categories' : 'tags')" :md-icon="option"/>
            </div>
        </md-card-content>
        <md-dialog :md-active.sync="showDeleteDialog" :md-fullscreen="false">
            <md-dialog-content>
                <span>Are you sure you want to delete this {{option}}?</span>
                <md-dialog-actions>
                    <md-button class="md-primary md-raised" @click="deleteItem">Yes</md-button>
                    <md-button class="md-primary" @click="showDeleteDialog = false;">No</md-button>
                </md-dialog-actions>
            </md-dialog-content>
        </md-dialog>
        <md-dialog :md-active.sync="showCreateDialog" :md-fullscreen="false">
            <md-dialog-title>
                <span class="md-subheading">Create New {{option[0].toUpperCase() + option.substring(1)}}</span>
            </md-dialog-title>
            <md-dialog-content>
                <form @submit.prevent="(newName && !validateNewName)? null : create()">
                    <md-field >
                        <label>{{option}} name</label>
                        <md-input v-model="newName"/>
                    </md-field>
                    <md-button class="md-primary md-raised" :disabled="newName && !validateNewName" v-show="!creating" type="submit" >
                        <span>Create {{option}}</span>
                    </md-button>
                    <md-button v-show="creating">
                        <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                    </md-button>
                </form>
            </md-dialog-content>
        </md-dialog>
        <md-dialog :md-active.sync="showRenameDialog" :md-fullscreen="false">
            <md-dialog-title>
                <span class="md-subheading">Rename {{option[0].toUpperCase() + option.substring(1)}}</span>
            </md-dialog-title>
            <md-dialog-content>
                <form @submit.prevent="(newName && !validateNewName)? null : rename()">
                    <md-field >
                        <label>New name</label>
                        <md-input v-model="newName"/>
                    </md-field>
                    <md-button class="md-primary md-raised" :disabled="newName && !validateNewName" v-show="!renaming" type="submit" >
                        <span>rename {{option}}</span>
                    </md-button>
                    <md-button v-show="renaming">
                        <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                    </md-button>
                </form>
            </md-dialog-content>
        </md-dialog>
        <md-dialog :md-active.sync="showOperationDialog" :md-fullscreen="false" :md-click-outside-to-close="false" :md-close-on-esc="false">
            <md-dialog-content>
                <div style="display: flex; justify-content:flex-start; align-items: center; height: 100%">
                    <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="30" style="width:auto; margin-right: .5em"/>
                    <span>deleting {{option}}...</span>
                </div>
            </md-dialog-content>
        </md-dialog>
        <md-snackbar :md-active.sync="showAlert" md-position="left">{{message}}</md-snackbar>
    </md-card>
</template>

<script>
export default {
    data(){
        return {
            option: "category",
            itemToOperateOn: null,
            showDeleteDialog: false,
            showCreateDialog: false,
            showOperationDialog: false,
            showRenameDialog: false,
            categories: [],
            tags: [],
            loadingTags: false,
            loadingCategories: false,
            searchString: "",
            creating: false,
            renaming: false,
            newName: "",
            showAlert: false,
            message: ""
        }
    },
    mounted(){
        this.loadTags();
        this.loadCategories()
    },
    computed: {
        items(){
            if(this.option == "category"){
                return this.categories.filter(
                    element => element.name.toUpperCase().indexOf(this.searchString.toUpperCase()) != -1
                ).sort(
                    (a, b) => a.name < b.name? -1 : 1
                )
            }
            else{
                return this.tags.filter(
                    element => element.name.toUpperCase().indexOf(this.searchString.toUpperCase()) != -1
                ).sort(
                    (a, b) => a.name < b.name? -1 : 1
                )
            }
        },
        loading(){
            return this.loadingTags || this.loadingCategories
        },
        validateNewName(){
            if(this.option == "category"){
                return this.categories.every(element => element.name.toUpperCase() != this.newName.toUpperCase())
            }
            else {
                return this.tags.every(element => element.name.toUpperCase() != this.newName.toUpperCase()) && !this.newName.trim().includes(" ")
            }
        }
    },
    methods: {
        deleteItem(){
            this.showOperationDialog = true
            this.showDeleteDialog = false;
            this.$http.request({
                url: `delete-${this.option}/`,
                method: "POST",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                content: JSON.stringify({
                    name: this.itemToOperateOn.name
                })
            }).then(response => {
                this.showOperationDialog = false
                if(this.option == "category"){
                    this.loadCategories()
                    this.message = "Category Deleted"
                }
                else{
                    this.loadTags()
                    this.message = "Tag Deleted"
                }
                this.showAlert = true
            })
        },
        loadTags(){
            this.loadingTags = true
            this.$http.request({
                url: "tags/?details=true",
                method: "POST",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                content: JSON.stringify({
                    searchString: ""
                })
            }).then(response => {
                this.tags = response.json().searchResults
                this.loadingTags = false
            })
        },
        loadCategories(){
            this.loadingCategories = true
            this.$http.request({
                url: "categories/?details=true",
            }).then(response => {
                this.categories = response.json().searchResults
                this.loadingCategories = false
            })
        },
        create(){
            this.creating = true
            this.$http.request({
                url: `create-${this.option}/`,
                method: "POST",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                content: JSON.stringify({
                    name: this.newName.trim()
                })
            }).then(response => {
                this.newName = ""
                this.message = `New ${this.option[0].toUpperCase() + this.option.substring(1)} Created`
                this.showAlert = true
                this.showCreateDialog = false
                if(this.option == "category"){
                    this.loadCategories()
                }
                else{
                    this.loadTags()
                }
                this.creating = false
            })
        },
        rename(){
            this.renaming= true
            this.$http.request({
                url: `edit-${this.option}/`,
                method: "POST",
                headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                content: JSON.stringify({
                    newName: this.newName.trim(),
                    name: this.itemToOperateOn.name
                })
            }).then(response => {
                this.newName = ""
                this.message = `${this.option[0].toUpperCase() + this.option.substring(1)} Renamed`
                this.showAlert = true
                this.showRenameDialog = false
                if(this.option == "category"){
                    this.loadCategories()
                }
                else{
                    this.loadTags()
                }
                this.renaming = false
            })
        }
    },
    watch: {
        showCreateDialog(newValue){
            if(!newValue){
                this.newName = ""
            }
        },
        showRenameDialog(newValue){
            if(!newValue){
                this.newName = ""
            }
        }
    }
}
</script>


<template>
    <md-card>
        <infinite-scroller id="comments-list-content" :class="{interfaced}" :refresh.sync="refresh" :showLoading="loading" :loader="loadGallery">
            <template slot-scope="{item}">
                <md-content>
                    <md-toolbar class="md-dense md-transparent" :md-elevation="0">
                        <div class="md-toolbar-section-start">
                            <span>
                                <md-icon>person</md-icon>
                                <span class="md-subheading">{{item.name}}</span>
                            </span>
                        </div>
                        <div class="md-toolbar-section-end">
                            <span class="md-caption">{{item.date}}</span>
                            <md-menu>
                                <md-button md-menu-trigger class="md-icon-button">
                                    <md-icon>more</md-icon>
                                </md-button>
                                <md-menu-item>
                                    <md-icon></md-icon>
                                    <span>Reference this comment</span>
                                </md-menu-item>
                                <md-menu-item>
                                    <md-icon>delete</md-icon>
                                    <span>Delete this comment</span>
                                </md-menu-item>
                            </md-menu>
                        </div>
                    </md-toolbar>
                    <md-card>
                    </md-card>
                    
                </md-content>
            </template>
            <div slot="md-empty-state">
                <md-empty-state md-label="No Results" md-icon="search" :md-description="`Couldn't find anything related to '${this.searchString}'`" v-if="searchString"/>
                <md-empty-state md-label="No Images" md-icon="collections"  md-description="There's nothing here." v-else />
            </div>
        </infinite-scroller>
        <md-dialog :md-active.sync="showDeleteDialog" :md-fullscreen="false">
            <md-dialog-content>
                <span>Are you sure you want to delete this image from the gallery?</span>
                <md-dialog-actions>
                    <md-button class="md-primary md-raised" @click="deleteGalleryImage">Yes</md-button>
                    <md-button class="md-primary" @click="showDeleteDialog = false;">No</md-button>
                </md-dialog-actions>
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
        <md-dialog :md-active.sync="showSaveToGalleryDialog" :md-fullscreen="false" :md-click-outside-to-close="false" :md-close-on-esc="false" @md-close="clearGalleryForm">
            <md-dialog-title>
                <md-icon class="md-size-2x">collections</md-icon>
                <span class="md-title">Save To Gallery</span>
                <md-button class="md-icon-button" @click="showSaveToGalleryDialog = false" style="float: right;">
                    <md-icon>close</md-icon>
                </md-button>
            </md-dialog-title>
            <md-dialog-content>
                <form @submit.prevent="saveToGallery">
                    <center>
                        <span @click="showFilesDialog = true">
                            <md-icon class="md-size-5x" v-if="!image">image</md-icon>
                            <img style="max-height: 240px" :class="{'md-error': imageError}" :src="image" v-else/>
                            <md-tooltip >select an image</md-tooltip>
                        </span>
                    </center>
                    <md-field>
                        <label>About this image...</label>
                        <md-textarea md-autogrow v-model="text" required/>
                    </md-field>
                    <span class="error-span">{{error}}</span>
                    <md-button class="md-primary md-raised" v-show="!savingToGallery" type="submit" >
                        <span>save to gallery</span>
                    </md-button>
                    <md-button v-show="savingToGallery">
                        <md-progress-spinner md-mode="indeterminate" :md-stroke="2" :md-diameter="25" style="width:auto"/>
                    </md-button>
                </form>
            </md-dialog-content>
        </md-dialog>
        <md-dialog :md-active.sync="showFilesDialog" style="min-width: 80%; min-height: 90vh;" :md-click-outside-to-close="false">
            <md-dialog-title>
                <md-button class="md-icon-button" style="float: right" @click="showFilesDialog = false" ><md-icon>close</md-icon></md-button>            
                <md-icon>image</md-icon>
                <span class="md-title">Select Image</span>
            </md-dialog-title>
            <files interfaced filter="image" @file-selected="image = $event; showFilesDialog = false"/>
        </md-dialog>
        <md-snackbar :md-active.sync="showAlert" md-position="left">{{message}}</md-snackbar>
    </md-card>
</template>

<script>
import InfiniteScroller from "./InfiniteScroller.vue";
import Files from "./Files.vue";

export default {
    props: {
        interfaced: Boolean,
    },
    components: {
        InfiniteScroller,
        Files
    },
    data(){
        return{
            galleryImageToOperateOn: null,
            searchString: "",
            showDeleteDialog: false,
            showOperationDialog: false,
            showFilesDialog: false,
            showAlert: false,
            searchTimeout: null,
            message: "",
            reloading: false,
            loading: false,
            refresh: false,
            error: "",
            savingToGallery: false,
            text: "",
            showSaveToGalleryDialog: false,
            image: "",
            imageError: false
        }
    },
    methods: {
        saveToGallery(){
            if(!this.image){
                this.error = "An image is required"
                this.imageError = true;
            }
            else{
                this.savingToGallery = true
                this.error = ""
                this.imageError = false,
                this.$http.request({
                    url: "save-gallery-image/",
                    method: "POST",
                    headers: {"Content-Type": "application/json", "X-CSRFToken": this.$cookies.get("csrftoken")},
                    content: JSON.stringify({
                        image: this.image,
                        text: this.text.trim(),
                        pk: this.galleryImageToOperateOn
                    })
                }).then(response => {
                    response = response.json()
                    this.message = "Image Saved"
                    this.showAlert = true
                    this.refresh = true
                    this.savingToGallery = false
                    this.showSaveToGalleryDialog = false
                    this.galleryImageToOperateOn = ""
                    this.$cookies.set("gallery-count", response.galleryCount)
                    this.$emit("change", response.galleryCount)
                }).catch(reason => {
                    if(reason == "The connection timed out. Please try again."){
                        this.message = reason;
                    }
                    else{
                        this.message = "Failed to complete request. Please try again."
                    }
                    this.showAlert = true;
                })
            }
        },
        editGalleryImage(item){
            this.galleryImageToOperateOn = item.pk
            this.text = item.text
            this.image = item.image
            this.showSaveToGalleryDialog = true
        },
        clearGalleryForm(){
            this.text = "";
            this.image = "";
            this.imageError = false
        },
        deleteGalleryImage(){
            this.message = "deleting...";
            this.showDeleteDialog = false;
            this.showOperationDialog = true;
            var pk = this.galleryImageToOperateOn;
            this.$http.request({
                url: `delete-gallery-image/?pk=${pk}`, 
            }).then(response => {
                response = response.json()
                this.showOperationDialog = false
                this.reloading = true;
                this.refresh = true;
                this.showAlert = true;
                this.message = "Gallery Image Deleted"
                this.galleryImageToOperateOn = ""
                this.$cookies.set("gallery-count", response.galleryCount)
                this.$emit("change", response.galleryCount)
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
                this.showOperationDialog = false
            })
        },
        loadGallery(page){
            return this.$http.request({
                url: `../gallery/?q=${escape(this.searchString.trim())}&page=${page}`
            }).then(response => {
                response = response.json()
                return {items: response.images, hasNextPage: response.hasNextPage}
            }).catch(reason => {
                if(reason == "The connection timed out. Please try again."){
                    this.message = reason;
                }
                else{
                    this.message = "Failed to complete request. Please try again."
                }
                this.showAlert = true;
            })
        },
    },
    watch: {
        searchString(newValue){
            if(this.searchTimeout){
                clearTimeout(this.searchTimeout);
                this.searchTimeout = null;
            }
            this.loading = true
            this.searchTimeout = setTimeout(() => {
                this.refresh = true
            }, 500)
        },
        refresh(newValue){
            if(!newValue){
                this.reloading = false;
                this.loading = false
            }
        }
    },
}
</script>

<style lang="scss">
#comments-list-content {
  overflow-y: auto;
  height: 24em;
  padding-top: 0;
  &.interfaced{
      height: auto;
  }
  .gallery-image{
      margin: 2em;
      width: 70% ;
      .md-card-area{
          opacity: 0;
          transition: .4s opacity ease-out;
      }
      &:hover .md-card-area{
          opacity: 1;
      }
  }
}
</style>


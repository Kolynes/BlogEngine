<template>
    <div>
        <v-toolbar dense flat>
            <v-spacer v-if="$vuetify.breakpoint.smAndUp"/>
            <v-text-field dense prepend-inner-icon="search" v-model="searchString" clearable placeholder="Find an image" :loading="searching"/>
            <v-btn icon @click="showSaveGalleryImageDialog = true">
                <v-icon>add</v-icon>
            </v-btn>
        </v-toolbar>
        <v-dialog v-model="showSaveGalleryImageDialog" persistent width="300">
            <v-card>
                <v-btn icon @click="showSaveGalleryImageDialog = false" style="float:right">
                    <v-icon>close</v-icon>
                </v-btn>
                <v-card-title>
                    <span class="subheading"><v-icon>image</v-icon> Save Image </span>
                </v-card-title>
                <v-card-text>
                    <v-form ref="saveGalleryImageForm" @submit.prevent="saveImage">
                        <v-text-field readonly v-model="image.name" label="Image" prepend-icon="image" :append-icon="image? 'close' : null" @click:append="image = ''" @click="showFilesDialog = true">
                            <v-avatar tile slot="prepend" v-if="image" >
                                <v-img :src="`${$base}/../preview/?file=${image.pk}`"/>
                            </v-avatar>
                        </v-text-field>
                        <v-textarea label="Caption" prepend-icon="more"/>
                        <v-btn icon type="submit" color="primary" :loading="saving">
                            <v-icon>keyboard_arrow_right</v-icon>
                        </v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-snackbar bottom :left="$vuetify.breakpoint.smAndUp" v-model="showSnackbar">
            <v-icon :color="snackbarMessage.iconColor">{{snackbarMessage.icon}}</v-icon>
            <span class="ml-2">{{snackbarMessage.message}}</span>
            <v-spacer/>
            <v-btn icon @click="showSnackbar = false">
                <v-icon>close</v-icon>
            </v-btn>
        </v-snackbar>
        <v-confirmation ref="confirmation"/>
        <v-dialog v-model="showFilesDialog" :fullscreen="$vuetify.breakpoint.xs" width="800">
            <v-sheet height="100%">
                <v-toolbar dense flat>
                    Select Image
                    <v-spacer/>
                    <v-btn icon @click="showFilesDialog = false">
                        <v-icon>close</v-icon>
                    </v-btn>
                </v-toolbar>
                <files interfaced filter="image" @selected="image = $event; showFilesDialog = false"/>
            </v-sheet>
        </v-dialog>
    </div>
</template>

<script>
export default {
    data(){
        return {
            searchString: "",
            image: "",
            caption: "",
            searchTimeout: null,
            refreshGallery: false,
            selectedImage: null,

            searching: false,
            saving: false,

            snackbarMessage: {},
            showSnackbar: false,
            showSaveGalleryImageDialog: false,
            showFilesDialog: false,
        }
    },
    methods: Object.assign({}, 
        Vuex.mapMutations([
            "setGalleryCount"
        ]),
        {
            saveImage(){
                if(this.$refs.saveGalleryImageForm.validate()){
                    var content = new FormData()
                    content.append("image", this.image.pk)
                    content.append("caption", this.caption)
                    if(this.selectedImage){
                        content.append("pk", this.selectedImage.pk)
                    }
                    this.saving = true
                    this.$http.request({
                        url: "home/save-gallery-image/",
                        method: "POST",
                        content
                    }).then(response => {
                        response = response.json()
                        this.saving = false;
                        if(response.status){
                            this.setGalleryCount(response.data.galleryCount)
                            this.snackbarMessage = {icon: "done", iconColor: "success", message: "Image saved in gallery"}
                            this.showSnackbar = true
                        }
                    }).catch(reason => {
                        console.log(reason)
                        this.saving = false;
                        this.snackbarMessage = {icon: "warning", iconColor: "red", message: "Failed to save image. Please try again"}
                        this.showSnackbar = true
                    })
                }
            },
            loadImages(page){
                return this.$http.request({
                    url: `../gallery?q=${escape(this.searchString)}&page=${page}`,
                }).then(response => {
                    response => response.json()
                    return {
                        items: response.data.images,
                        hasNextPage: response.data.hasNextPage
                    }
                })
            },
            deleteImage(){
                
            }
        }
    ),
    watch: {
        searchString(newValue){
            this.searching = true
            if(this.searchTimeout){
                clearTimeout(this.searchTimeout)
                this.searchTimeout = null
            }
            this.searchTimeout = setTimeout(() => {
                this.searching = false
                this.refreshGallery = true;
            }, 500)
        },
        showSaveGalleryImageDialog(newValue){
            if(!newValue){
                this.$refs.saveGalleryImageForm.validate()
            }
        }
    }
}
</script>
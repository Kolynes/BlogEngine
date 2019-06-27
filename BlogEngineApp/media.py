##### Code for a media library object ######

##Media model

class Media(models.Model):
    name = models.CharField(max_length=100)
    downloads = models.IntegerField(default=0)
    file = models.FileField(upload_to="media")
    type = models.CharField(max_length=50)
    date = models.DateTimeField(auto_now_add=True)
    hash = models.CharField(max_length=20, primary_key=True)

    def get_dict_value(self):
        return {
            "name": self.name,
            "type": self.type,
            "date": self.date.strftime("%a, %d %b, %Y %H:%M"),
            "pk": self.pk,
            "downloads": self.downloads,
        }


##Media views and interfaces

def media(request):
    if not request.session.get("username", False):
        return JsonResponse({
            "result": False,
            "error": "Not signed in"
        })
    else:
        media_list = []
        for media_object in models.Media.objects.all():
            media_list.append(media_object.get_dict_value())
        return JsonResponse({
            "media": media_list
        })
        
def upload_media(request):
    if not request.session.get("username", False):
        return JsonResponse({
            "result": False,
            "error": "Not signed in"
        })
    else:
        for filename, file in request.FILES.items():
            models.Media(
                name=filename,
                file=file,
                type=file.content_type,
                hash=code_generator.generate_code(20)
            ).save()

        return JsonResponse({
            "result": True,
        })

def delete_media(request):
    if not request.session.get("username", False):
        return JsonResponse({
            "result": False,
            "error": "Not signed in"
        })
    else:
        data = json.loads(request.body.decode("utf8"))
        for media in data["media"]:
            media = models.Media.objects.get(pk=media)
            os.remove(media.file.path)
            media.delete()
        return JsonResponse({
            "result": True,
        })

# media.vue

# <template>
#     <div>
#         <div>
#              <md-table md-fixed-header md-card md-scrollbar v-model="filteredMedia" ref="table" >
#                 <md-table-toolbar>
#                     <div class="md-toolbar-section-start">
#                         <md-button class="md-icon-button" @click="showUploadDialog = true">
#                             <md-icon>cloud_upload</md-icon>
#                             <file-upload :show-upload-dialog="showUploadDialog" @close="showUploadDialog = false" @uploaded="refresh"/>
#                         </md-button>
#                         <md-button class="md-icon-button" id="refresh" :class="{refreshing}" @click="refresh" >
#                             <md-icon>refresh</md-icon>
#                         </md-button>

#                     </div>
#                     <div class="md-toolbar-section-start">
#                         <md-field md-clearable>
#                             <md-input placeholder="Search" v-model="searchString" @input="search()"/>
#                         </md-field>
#                     </div>
#                 </md-table-toolbar>
#                 <md-table-toolbar slot='md-table-alternate-header' slot-scope='{ count }'>
#                     <div class="md-toolbarr-section-start">
#                         <span>{{count}} selected</span>
#                     </div>
#                     <div class="md-toolbar-section-end">
#                         <md-button class="md-icon-button" @click="showDeleteDialog = true">
#                             <md-icon :class="{deleting}">delete</md-icon>
#                         </md-button>
#                         <md-button class="md-icon-button" :href="downloadMedia()" v-if="count < 2">
#                             <md-icon>cloud_download</md-icon>
#                         </md-button>
#                         <md-button class="md-icon-button" :href="previewMedia()" v-if="count < 2">
#                             <md-icon>play_arrow</md-icon>
#                         </md-button>
#                     </div>
#                 </md-table-toolbar>

#                 <md-table-empty-state md-label='No media found' :md-description='searchString? `We could not find ${searchString}` : "There is nothing here"'/>
#                 <md-table-row class='md-primary'  md-sort-by='Name' slot='md-table-row' slot-scope='{ item }' md-selectable='multiple' md-auto-select>
#                     <md-table-cell md-label='Name'><md-icon>{{getMaterialIcon(item.type)}}</md-icon> {{item.name}}</md-table-cell>
#                     <md-table-cell md-label='Downloads' numeric>{{item.downloads}}</md-table-cell>
#                     <md-table-cell md-label='Upload On'>{{item.date}}</md-table-cell>
#                 </md-table-row>
#             </md-table>
#         </div>
#         <md-dialog :md-active.sync="showDeleteDialog" :md-fullscreen="false">
#             <md-dialog-content>
#                 <span>Are you sure you want to delete {{selectedMedia.length == 1? "this file" : "these files"}}?</span>
#             </md-dialog-content>
#             <md-dialog-actions>
#                 <md-button v-show="!deleting" @click="deleteMedia">Yes</md-button>
#                 <md-button @click="showDeleteDialog = false;">No</md-button>
#             </md-dialog-actions>
#         </md-dialog>
#         <md-snackbar :md-active.sync="showAlert" md-position="left">{{message}}</md-snackbar>
#     </div>
# </template>

# <script>
# import FileUpload from "./FileUpload.vue"
# export default {
#     data(){
#         return{
#             media: [],
#             filteredMedia:[],
#             selectedMedia: [],
#             searchString: "",
#             refreshing: false,
#             deleting: false,
#             showUploadDialog: false,
#             showDeleteDialog: false,
#             showAlert: false,
#             message: ""
#         }
#     },
#     methods: {
#         fetchMedia(){
#             this.$http.request({
#                 url: "/admin/media/", 
#                 method: "GET",
#             }).then(response => response.json()).then(response =>{
#                 this.media = response.media
#                 this.filteredMedia = this.media;
#             })
#         },
#         search(){
#             if(this.media.length){
#                 this.filteredMedia = this.media.filter(item => item.name.includes(this.searchString))
#             }
#         },
#         getMaterialIcon(type){
#             if(type.includes("image")){
#                 return "image";                    
#             }
#             else if(type.includes("video")){
#                 return "movie";                        
#             }
#             else if(type.includes("audio")){
#                 return "audiotrack";                        
#             }
#             else if(type.includes("text") || type.includes("application")){
#                 return "description";                        
#             }
#             else{
#                 return "info"
#             }
#         },
#         refresh(){
#             this.refreshing = true;
#             this.$http.request({
#                 url: "/admin/media/", 
#                 method: "GET",
#             }).then(response => response.json()).then(response =>{
#                 this.media = response.media
#                 this.filteredMedia = this.media;
#                 this.selectedMedia = []
#                 this.$refs.table.MdTable.selectedItems = []
#                 setTimeout(() => this.refreshing = false, 1000)
#             })
#         },
#         deleteMedia(){
#             var pks = [];
#             this.showDeleteDialog = false;
#             this.deleting = true;
#             for(let i in this.selectedMedia){
#                 pks.push(this.selectedMedia[i].pk)
#             }
#             this.$http.request({
#                 url: "/admin/delete-media/", 
#                 method: "POST",
#                 headers: {"X-CSRFToken": this.$cookies.get("csrftoken")},
#                 content: JSON.stringify({media: pks})
#             }).then(() => {
#                 this.refresh()
#                 this.showAlert = true;
#                 this.message = "Selected media files have been deleted."
#                 setTimeout(() => this.deleting = false, 1000)
#             })
#         },
#         downloadMedia(){
#             return `/download-media/?media=${this.selectedMedia[0].pk}`
#         },
#         previewMedia(){
#             return `/preview-media/?media=${this.selectedMedia[0].pk}`
#         }
#     },
#     mounted(){
#         this.$watch("$refs.table.MdTable.selectedItems", (value, oldValue) => {this.selectedMedia = value})
#         setImmediate(() => this.fetchMedia())
#     },
#     components: {
#         FileUpload
#     }
    
# }
# </script>

# <style lang="scss" >
    
# </style>

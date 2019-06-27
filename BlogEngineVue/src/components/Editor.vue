<template>
    <div>
        <div ref="editor" class="editor" :style="{height}"/>
        <md-dialog :md-active.sync="showFilesDialog" style="min-width: 80%; min-height: 90vh;" :md-click-outside-to-close="false">
            <md-dialog-title>
                <md-button class="md-icon-button" style="float: right" @click="showFilesDialog = false" ><md-icon>close</md-icon></md-button>
                <md-icon>insert_drive_file</md-icon>
                <span class="md-title">Select File</span>
            </md-dialog-title>
            <files interfaced :filter="fileFilter" @file-selected="fileSelected"/>
        </md-dialog>
        <md-dialog :md-active.sync="showLinkSelectionDialog" style="min-width: 80%; min-height: 90vh;" :md-click-outside-to-close="false">
            <md-dialog-title>
            <md-button class="md-icon-button" style="float: right" @click="showLinkSelectionDialog = false"><md-icon>close</md-icon></md-button>
            <md-tabs>
                <md-tab  md-label="Articles" @click="showTab = 'articles'">
                </md-tab>
                <md-tab md-label="Files" @click="showTab = 'files'">
                </md-tab>
            </md-tabs>
            </md-dialog-title>
            <article-list v-show="showTab == 'articles'" interfaced @article-selected="link = $event"/>
            <files interfaced  v-show="showTab == 'files'" :filter="fileFilter" @file-selected="link = $event"/>
            <md-dialog-actions style="position: absolute; bottom: 0; width: 100%">
                <md-field style="width: 15em;" >
                    <md-icon>insert_link</md-icon>
                    <label>Enter URL</label>
                    <md-input v-model="link"/>
                </md-field>&nbsp;
                <md-button class="md-primary md-raised" @click="linkSelected(link)">save</md-button>
            </md-dialog-actions>
        </md-dialog>
        <md-dialog :md-active.sync="showEmbeddedFileTypeSelectorDialog" :md-fullscreen="false">
            <md-dialog-content>
                <md-dialog-title>
                    <span class="md-title">Embed media type</span>
                </md-dialog-title>
                <md-list>
                    <md-list-item @click="embedMedia('external')">
                        <md-icon>link</md-icon>
                        <span class="md-list-item-text">External</span>
                    </md-list-item>
                    <md-divider class="md-inset"/>
                    <md-list-item @click="embedMedia('video')">
                        <md-icon>theaters</md-icon>
                        <span class="md-list-item-text">Video</span>
                    </md-list-item>
                    <md-divider class="md-inset"/>
                    <md-list-item @click="embedMedia('audio')">
                        <md-icon>audiotrack</md-icon>
                        <span class="md-list-item-text">Audio</span>
                    </md-list-item>
                    <md-divider class="md-inset"/>
                </md-list>
            </md-dialog-content>
        </md-dialog>
        <md-dialog :md-active.sync="showExternalLinkDialog" :md-fullscreen="false">
            <md-dialog-content>
                <form @submit.prevent="embedExternalLink">
                    <md-field>
                        <md-icon>link</md-icon>
                        <label>Enter link</label>
                        <md-input v-model="externalLink"/>
                    </md-field>
                </form>
            </md-dialog-content>
        </md-dialog>
    </div>
</template>

<script>
import Files from "./Files.vue";
import ArticleList from "./ArticleList.vue";

var toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["link", "image"],
    ["blockquote", "code-block"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"]
];

export default {
    name: "Editor",
    data() {
        return {
          fileFilter: "",
          showFilesDialog: false,
          showEmbeddedFileTypeSelectorDialog: false,
          showLinkSelectionDialog: false,
          showExternalLinkDialog: false,
          showTab: "articles",
          instance: null,
          link: "",
          externalLink: ""
        };
    },
    props: {
        height: {
            type: String,
            default: "70vh"
        }
    },
    components: {
        Files,
        ArticleList
    },
    methods: {
        createEditor() {
            this.instance = new this.$Quill(this.$refs.editor, {
                modules: { toolbar: toolbarOptions },
                theme: "snow"
            });
            this.instance.getModule("toolbar").addHandler("image", () => {
                this.fileFilter = "image";
                this.showFilesDialog = true;
            });
            this.instance.getModule("toolbar").addHandler("video", () => {
                this.showEmbeddedFileTypeSelectorDialog = true;
            });
            this.instance.getModule("toolbar").addHandler("link", () => {
                if (this.instance.getSelection().length != 0) {
                    this.showLinkSelectionDialog = true;
                }
            });
            let BlockEmbed = Quill.import('blots/block/embed');
            class VideoBlot extends BlockEmbed {
            static create(url) {
                let node = super.create();
                return node;
            }

            static formats(node) {
            }

            static value(node) {
                return node.getAttribute('src');
            }
            }
            VideoBlot.blotName = 'video';
            VideoBlot.tagName = 'video';
            Quill.register(VideoBlot)
        },
        embedMedia(fileType) {
            if (fileType == "external") {
                this.showExternalLinkDialog = true;
            } else {
                this.fileFilter = fileType;
                this.showFilesDialog = true;
            }
            this.showEmbeddedFileTypeSelectorDialog = false;
        },
        linkSelected(url) {
            this.instance.format("link", url);
            var range = this.instance.getSelection();
            this.instance.setSelection(range.index + range.length, 0);
            this.showLinkSelectionDialog = false;
        },
        fileSelected(url) {
            try {
                this.instance.format(this.fileFilter, url);
            } catch (e) {}
            this.showFilesDialog = false;
        },
        embedExternalLink() {
            try {
                this.instance.format("video", this.externalLink, {
                    width: 300,
                    height: 400
                });
            } catch (e) {}
            this.showExternalLinkDialog = false;
        },
        rawContent() {
            return document.querySelector("div[contenteditable]").innerHTML;
        }
    },
    mounted() {
        this.createEditor();
    }
};
</script>

<style>
  .ql-toolbar {
      background: white !important;
  }
  .editor {
      background: white;
      color: #222222;
  }
  .md-dialog-title {
      padding: 0.5em;
      margin-bottom: 0;
  }
</style>

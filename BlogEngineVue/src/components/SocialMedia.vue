<template>
    <md-card >
        <md-card-content>
            <center>
                <md-avatar>
                    <img @click="showFBDialog = true" src="/static/BlogEngineApp/images/fb-icon.png">
                </md-avatar>
                <md-avatar class="md-large">
                    <img src="/static/BlogEngineApp/images/twitter-icon.png">
                </md-avatar>
                <md-avatar>
                    <img src="/static/BlogEngineApp/images/instagram-icon.png">
                </md-avatar>
            </center>
        </md-card-content>
        <md-dialog :md-active.sync="showFBDialog">
            <center>
                <iframe src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fbraintechinnovators%2F&tabs=messages&width=320&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" style="border:none;overflow:hidden;height:1000px; width:320px" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe>
            </center>
        </md-dialog>
    </md-card>
</template>

<script>
export default {
    data(){
        return {
            showFBDialog: false
        }
    }
}
</script>

<style scoped>
    .md-avatar img.unset{
        filter: grayscale(100);
        transition: filter, .4s ease-out;
    }
    .md-avatar img.unset:hover{
        filter: grayscale(0)
    }
</style>

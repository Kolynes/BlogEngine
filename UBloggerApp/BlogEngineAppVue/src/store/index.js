export default new Vuex.Store({
    state: {
        username: "",
        name: "",
        email: "",
        description: "",
        profilePicture: false,
        articleCount: "0",
        eventCount: "0",
        galleryCount: "0",
        lastActive: "",
        isSuperuser: false,
        admins: {},
        dark: localStorage.getItem("dark") == "true",
        directoryListingFormat: localStorage.getItem("directory-listing-format") || "apps",
        currentDirectory: ""
    },
    mutations: {
        setUsername(state, value){
            state.username = value
        },
        setName(state, value){
            state.name = value
        },
        setEmail(state, value){
            state.email = value
        },
        setDescription(state, value){
            state.description = value
        },
        setProfilePicture(state, value){
            state.profilePicture = value
        },
        setArticleCount(state, value){
            state.articleCount = value;
        },
        setEventCount(state, value){
            state.eventCount = value;
        },
        setGalleryCount(state, value){
            state.galleryCount = value
        },
        setLastActive(state, value){
            state.lastActive = value
        },
        setAdmins(state, value){
            state.admins = value
        },
        toggleTheme(state){
            state.dark = !state.dark
            localStorage.setItem("dark", state.dark)
        },
        toggleDirectoryListingFormat(state){
            state.directoryListingFormat = state.directoryListingFormat == "apps"? "list" : "apps";
            localStorage.setItem("directory-listing-format", state.directoryListingFormat)
        },
        setCurrentDirectory(state, value){
            state.currentDirectory = value
        },
        setIsSuperuser(state, value){
            state.isSuperuser = value
        }
    }
})
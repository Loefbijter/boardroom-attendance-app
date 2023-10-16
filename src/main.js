import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

// Axios
import axios from 'axios'
import VueAxios from 'vue-axios'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
})

// Vuex
import store from './store'

const app = createApp(App)

app.use(vuetify)
app.use(store)
app.use(VueAxios, axios)
app.mount('#app')

import { createStore } from 'vuex'
import availability from './availability';
import VuexPersistence from "vuex-persist";

const vuexLocal = new VuexPersistence({
    storage: window.localStorage,
});

export default createStore({
    state: {
    },
    getters: {
    },
    mutations: {
    },
    actions: {
    },
    modules: {
        availability
    },
    plugins: [vuexLocal.plugin]
})
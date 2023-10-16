import mutations from './mutations';
import getters from './getters';

export default {
    namespaced: true,
    state() {
        return {
            availability: false
        }
    },
    mutations,
    getters
}
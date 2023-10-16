import { GET_AVAILABILITY } from "../storeconstants";

export default {
    [GET_AVAILABILITY](state) {
        return state.availability;
    },
}
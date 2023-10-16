import {
    SET_AVAILABILITY,
} from "../storeconstants";

export default {
    [SET_AVAILABILITY](state, availability) {
        state.availability = availability
    },
}
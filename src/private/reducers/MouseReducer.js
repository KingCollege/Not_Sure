import { MOUSE_LEFT_CLICK, MOUSE_POS_CHANGE, SELECTABLE_COMPONENT } from '../actions/MouseActionCreator'

const initial_state = {
    mouse_pos: {},
    mouse_left_click: false,
    mouse_left_click_pos: {},
    mouse_right_click: false,
    mouse_right_click_pos: {},
    component_selected: SELECTABLE_COMPONENT.NONE,
}

const mouse = (state = initial_state, action) => {
    switch (action.type) {
        case MOUSE_POS_CHANGE:
            // console.log(action.pos)
            return { ...state, mouse_pos: action.pos }
        case MOUSE_LEFT_CLICK:
            return {
                ...state,
                mouse_left_click: action.info.bool,
                mouse_left_click_pos: action.info.pos,
                component_selected: action.info.component,
            }
        default:
            return state
    }
}

export default mouse

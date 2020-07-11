import { GIVE_CELL, GIVE_MOUSE_POS } from '../actions/SelectCellAction'

const initial_state = {
    mouse_pos: {},
    cell: {},
}

const select_cell = (state = initial_state, action) => {
    switch (action.type) {
        case GIVE_MOUSE_POS:
            return action.pos
        case GIVE_CELL:
            return action.cell
        default:
            return state
    }
}

export default select_cell

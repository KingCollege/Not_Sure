import {
    GIVE_CELL,
    GIVE_MOUSE_POS,
    GRID_INITIALISE,
    CHANGE_ORIGIN,
    CHANGE_CELL_INFO,
} from '../actions/GridActionCreator'

const window_width = 1980
const window_height = 1024

const initial_state = {
    mouse_pos: {},
    persist_cells: [],
    grid_width: window_width,
    grid_height: window_height,
    origin: { x: window_width / 2, y: window_height / 2, extra_offset_x: 0, extra_offset_y: 0 },
    cell_info: {
        cell_size: 25,
        const_cell_size: 25,
        enlargement: 4,
    },
}

const select_cell = (state = initial_state, action) => {
    switch (action.type) {
        case GRID_INITIALISE:
            return { ...state, ...action.info }
        case GIVE_MOUSE_POS:
            return { ...state, mouse_pos: action.pos }
        case GIVE_CELL:
            if (
                state.persist_cells.filter(
                    (e) => e.x_wrt_origin === action.cell.x_wrt_origin && e.y_wrt_origin === action.cell.y_wrt_origin
                ).length == 0
            ) {
                return { mouse_pos: {}, persist_cells: [...state.persist_cells, action.cell] }
            }
            return { ...state, mouse_pos: {} }
        case CHANGE_CELL_INFO:
            // console.log(action.cell_info)
            return { ...state, cell_info: action.cell_info }
        case CHANGE_ORIGIN:
            // console.log(action.origin)
            return { ...state, origin: action.origin }
        default:
            return state
    }
}

export default select_cell

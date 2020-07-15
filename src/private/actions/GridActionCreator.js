export const GIVE_MOUSE_POS = 'GIVE_MOUSE_POS'
export const GIVE_CELL = 'GIVE_CELL'
export const GRID_INITIALISE = 'GRID_INITIALISE'
export const CHANGE_ORIGIN = 'CHANGE_ORIGIN'
export const CHANGE_CELL_INFO = 'CHANGE_CELL_INFO'

export const give_mouse_pos = (pos) => {
    return {
        type: GIVE_MOUSE_POS,
        pos,
    }
}

export const give_cell = (cell) => {
    return {
        type: GIVE_CELL,
        cell,
    }
}

export const grid_initialise = (info) => {
    return {
        type: GRID_INITIALISE,
        info,
    }
}

export const change_origin = (origin) => {
    return {
        type: CHANGE_ORIGIN,
        origin,
    }
}

export const change_cell_info = (cell_info) => {
    return {
        type: CHANGE_CELL_INFO,
        cell_info,
    }
}

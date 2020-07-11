export const GIVE_MOUSE_POS = 'GIVE_MOUSE_POS'
export const GIVE_CELL = 'GIVE_CELL'

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

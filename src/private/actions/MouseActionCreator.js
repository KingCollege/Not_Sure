export const MOUSE_POS_CHANGE = 'MOUSE_POS_CHANGE'
export const MOUSE_LEFT_CLICK = 'MOUSE_LEFT_CLICK'

export const SELECTABLE_COMPONENT = {
    NONE: '',
    GRID: 'GRID',
    SETTING: 'SETTING',
}

export const mouse_pos_change = (pos) => {
    return {
        type: MOUSE_POS_CHANGE,
        pos,
    }
}

export const mouse_left_click = (info) => {
    return {
        type: MOUSE_LEFT_CLICK,
        info,
    }
}

import { combineReducers } from 'redux'
import GridCellReducer from './GridReducer'
import MouseReducer from './MouseReducer'
export default combineReducers({
    grid_cell: GridCellReducer,
    mouse: MouseReducer,
})

import React, { Component } from 'react'
import './css/GraphVisual.css'
import Hoverer from './Hoverer'
import { give_mouse_pos, grid_initialise, change_cell_info, change_origin } from '../private/actions/GridActionCreator'
import { mouse_pos_change, mouse_left_click, SELECTABLE_COMPONENT } from '../private/actions/MouseActionCreator'
import { connect } from 'react-redux'

class GraphVisual extends Component {
    constructor(props) {
        super(props)
        this.canvas_ref = React.createRef()
        this.x_offset = 0
        this.y_offset = 0
        this.hovering_cells = []
    }

    componentDidMount() {
        this.redraw_all()
    }

    componentWillUnmount() {
        console.log('unmounted')
    }

    componentDidUpdate(prev_props) {
        if (prev_props.grid.cell_info != this.props.grid.cell_info) {
            this.redraw_all()
        }

        if (prev_props != this.props) {
            const canvas = this.canvas_ref.current
            const ctx = canvas.getContext('2d')
            this.draw_persist_cell(ctx)
        }
    }

    mouse_move(event) {
        const last_mouse = {
            x: event.clientX,
            y: event.clientY,
            x_wrt_canvas: event.clientX / this.props.grid.cell_info.cell_size,
            y_wrt_canvas: event.clientY / this.props.grid.cell_info.cell_size,
        }
        this.props.mouse_pos_change(last_mouse)
        if (this.props.component_selected === SELECTABLE_COMPONENT.GRID) {
            this.translation(event, last_mouse)
        } else {
            this.setState({ last_mouse })
        }
    }

    mouse_down(event) {
        if (event.button === 0) {
            this.props.mouse_left_click({ bool: true, pos: this.props.mouse_pos, component: SELECTABLE_COMPONENT.GRID })
        }
        if (event.button === 2) {
            // const x_wrt_origin = parseInt(this.props.grid.origin.x - this.state.last_mouse.x)
            // const y_wrt_origin = parseInt(this.props.grid.origin.y - this.state.last_mouse.y)
            this.props.select_cell({ x: event.clientX, y: event.clientY })
        }
    }

    mouse_up(event) {
        this.props.mouse_left_click({ bool: false, pos: this.props.mouse_pos, component: SELECTABLE_COMPONENT.NONE })
        if (this.x_offset == 0 && this.y_offset == 0) {
            return
        }
        // Set offset as default position of canvas
        event.target.style.x = this.x_offset
        event.target.style.y = this.y_offset
    }

    translation(event, last_mouse) {
        this.x_offset =
            last_mouse.x -
            this.props.mouse_left_click_pos.x +
            (event.target.style.x ? parseInt(event.target.style.x) : this.props.grid.grid_width / 2)
        this.y_offset =
            last_mouse.y -
            this.props.mouse_left_click_pos.y +
            (event.target.style.y ? parseInt(event.target.style.y) : this.props.grid.grid_height / 2)

        // Infinite Graph: Just change origin offset, then redraw everything from new origin. Jesus im stupid.
        const origin = { ...this.props.grid.origin }
        origin.x = this.x_offset + origin.extra_offset_x
        origin.y = this.y_offset + origin.extra_offset_y
        this.props.change_origin(origin)
        this.redraw_all()
    }

    scroll_zoom(event) {
        if (event.deltaY > 0) {
            this.zoom(-1)
        } else {
            this.zoom(1)
        }
    }

    zoom(dir) {
        var cell_info = { ...this.props.grid.cell_info }
        cell_info.cell_size = cell_info.cell_size + dir
        if (cell_info.cell_size > cell_info.const_cell_size + 10) {
            cell_info.cell_size = cell_info.cell_size - dir
            dir = 0
        } else if (cell_info.cell_size < cell_info.const_cell_size - 5) {
            cell_info.cell_size = cell_info.cell_size - dir
            dir = 0
        }

        this.props.change_cell_info(cell_info)
        const origin = { ...this.props.grid.origin }
        const x_diff = origin.x - this.props.mouse_pos.x
        const y_diff = origin.y - this.props.mouse_pos.y
        origin.extra_offset_x += Math.sign(Math.abs(x_diff) > 5 ? x_diff : 0) * 10 * dir
        origin.extra_offset_y += Math.sign(Math.abs(y_diff) > 5 ? y_diff : 0) * 10 * dir
        origin.x += Math.sign(Math.abs(x_diff) > 5 ? x_diff : 0) * 10 * dir
        origin.y += Math.sign(Math.abs(y_diff) > 5 ? y_diff : 0) * 10 * dir
        this.props.change_origin(origin)
    }

    redraw_all() {
        const canvas = this.canvas_ref.current
        const ctx = canvas.getContext('2d')
        ctx.setTransform()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        this.draw_cells()
        this.draw_axis(ctx)
        this.draw_persist_cell(ctx)
    }

    draw_cells() {
        const canvas = this.canvas_ref.current
        const ctx = canvas.getContext('2d')
        this.hovering_cells = []
        //Clockwise Quadrants: DO NOT CHANGE
        this.draw_quadrant(ctx, { x: 0, y: 0 }) //0
        this.draw_quadrant(ctx, { x: this.props.grid.grid_width, y: 0 }) //1
        this.draw_quadrant(ctx, { x: this.props.grid.grid_width, y: this.props.grid.grid_height }) //2
        this.draw_quadrant(ctx, { x: 0, y: this.props.grid.grid_height }) //3
        this.draw_axis(ctx)
    }

    draw_quadrant(ctx, quad_limit) {
        this.hovering_cells.push([])
        const x_incr = this.props.grid.origin.x > quad_limit.x ? -1 : 1
        const y_incr = this.props.grid.origin.y > quad_limit.y ? 1 : -1
        const wrt_cell = {
            x: this.props.grid.origin.x / this.props.grid.cell_info.cell_size + (x_incr > 0 ? 0 : -1),
            y: this.props.grid.origin.y / this.props.grid.cell_info.cell_size + (y_incr > 0 ? -1 : 0),
            width: quad_limit.x / this.props.grid.cell_info.cell_size + (x_incr > 0 ? 0 : -1),
            height: quad_limit.y / this.props.grid.cell_info.cell_size + (y_incr < 0 ? 0 : -1),
        }
        ctx.fillStyle = this.props.grid.cell_info.cell_color
        ctx.strokeStyle = this.props.grid.cell_info.stroke_color
        ctx.lineWidth = 0.75
        // Multiply by -1 we can switch the inequality
        for (var x = wrt_cell.x; x * x_incr < wrt_cell.width * x_incr; x += x_incr) {
            for (var y = wrt_cell.y; y * y_incr > wrt_cell.height * y_incr; y -= y_incr) {
                ctx.strokeRect(
                    x * this.props.grid.cell_info.cell_size,
                    y * this.props.grid.cell_info.cell_size,
                    this.props.grid.cell_info.cell_size,
                    this.props.grid.cell_info.cell_size
                )
                this.hovering_cells[this.hovering_cells.length - 1].push({
                    x: x * this.props.grid.cell_info.cell_size,
                    y: y * this.props.grid.cell_info.cell_size,
                    opacity: 0,
                })
            }
        }
    }

    // ISSUE: Crashes when out of screen
    draw_persist_cell(ctx) {
        ctx.fillStyle = 'black'
        this.props.grid.persist_cells.forEach((cell) => {
            const x_quad = cell.x_wrt_origin > -1 ? -1 : 0
            const y_quad = cell.y_wrt_origin > -1 ? 1 : 0
            ctx.fillRect(
                this.props.grid.origin.x -
                    (parseInt(cell.x_wrt_origin / this.props.grid.cell_info.cell_size) - x_quad) *
                        this.props.grid.cell_info.cell_size,
                this.props.grid.origin.y -
                    (parseInt(cell.y_wrt_origin / this.props.grid.cell_info.cell_size) + y_quad) *
                        this.props.grid.cell_info.cell_size,
                this.props.grid.cell_info.cell_size,
                this.props.grid.cell_info.cell_size
            )
        })
    }

    draw_axis(ctx) {
        ctx.lineWidth = 4
        ctx.strokeStyle = 'black'
        ctx.beginPath()
        ctx.moveTo(this.props.grid.origin.x, 0)
        ctx.lineTo(this.props.grid.origin.x, this.props.grid.grid_height)
        ctx.stroke()
        ctx.strokeStyle = 'black'
        ctx.beginPath()
        ctx.moveTo(0, this.props.grid.origin.y)
        ctx.lineTo(this.props.grid.grid_width, this.props.grid.origin.y)
        ctx.stroke()
        ctx.strokeStyle = this.props.grid.cell_info.stroke_color
    }

    render() {
        return (
            <div>
                {/* <Hoverer
                    cells_quad={this.hovering_cells}
                    cell_size={this.props.grid.cell_info.cell_size}
                    origin={this.props.grid.origin}
                    window_height={this.props.grid.grid_height}
                    window_width={this.props.grid.grid_height}
                /> */}
                <canvas
                    ref={this.canvas_ref}
                    width={this.props.grid.grid_width}
                    height={this.props.grid.grid_height}
                    className='main-canvas'
                    onContextMenu={(e) => {
                        e.preventDefault() // disables default browser behaviour
                        // right click gives context menu
                    }}
                    onWheel={this.scroll_zoom.bind(this)}
                    onMouseMove={this.mouse_move.bind(this)}
                    onMouseDown={this.mouse_down.bind(this)}
                    onMouseUp={this.mouse_up.bind(this)}
                    // onMouseLeave={this.mouse_up.bind(this)}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    grid: state.grid_cell,
    mouse_pos: state.mouse.mouse_pos,
    mouse_left_click_pos: state.mouse.mouse_left_click_pos,
    component_selected: state.mouse.component_selected,
})

const mapDispatchToProps = (dispatch) => ({
    select_cell: (pos) => dispatch(give_mouse_pos(pos)),
    mouse_pos_change: (pos) => dispatch(mouse_pos_change(pos)),
    mouse_left_click: (bool) => dispatch(mouse_left_click(bool)),
    grid_initialise: (info) => dispatch(grid_initialise(info)),
    change_cell_info: (info) => dispatch(change_cell_info(info)),
    change_origin: (origin) => dispatch(change_origin(origin)),
})

export default connect(mapStateToProps, mapDispatchToProps)(GraphVisual)

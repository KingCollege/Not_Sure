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
        this.DEBUG_COUNT = 0
    }

    componentDidMount() {
        this.redraw_all()
    }

    componentWillUnmount() {
        console.log('unmounted')
    }

    componentDidUpdate(prev_props) {
        if (prev_props.grid.cell_info !== this.props.grid.cell_info) {
            this.redraw_all()
        }

        if (prev_props !== this.props) {
            const canvas = this.canvas_ref.current
            const ctx = canvas.getContext('2d')
            this.draw_persist_cell(ctx)
        }
    }

    mouse_move(event) {
        const last_mouse = {
            x: event.clientX,
            y: event.clientY,
            x_wrt_origin: parseInt(this.props.grid.origin.x - event.clientX),
            y_wrt_origin: parseInt(this.props.grid.origin.y - event.clientY),
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

    async translation(event, last_mouse) {
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
        await this.props.change_origin(origin) // Origin doesn't update immediately, so await it.
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
        ctx.strokeStyle = 'grey'
        ctx.lineWidth = 1
        ctx.setTransform()
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        this.DEBUG_COUNT = 0
        this.draw_grid_lines(ctx)
        this.draw_axis(ctx)
        this.draw_persist_cell(ctx)
        console.log('Debug Count: ' + this.DEBUG_COUNT)
    }

    draw_grid_lines(ctx) {
        const cell_size = this.props.grid.cell_info.cell_size
        const origin = this.props.grid.origin

        const pre_calculation = {
            y: {
                positive: Math.round(origin.y / cell_size) + 5, // How many lines we need from origin to edge
                negative: Math.round((this.props.grid.grid_height - origin.y) / cell_size) + 5, // As origin changes; leftover section
            },
            x: {
                negative: Math.round(origin.x / cell_size) + 5,
                positive: Math.round((this.props.grid.grid_width - origin.x) / cell_size) + 5,
            },
        }
        var extra_negative = pre_calculation.y.negative < 0 ? pre_calculation.y.negative : 0
        var extra_positive = pre_calculation.y.positive < 0 ? pre_calculation.y.positive : 0
        // Y-Axis
        var y_limit = pre_calculation.y.positive
        for (var y = -pre_calculation.y.positive; y <= pre_calculation.y.negative; y++) {
            if (y === 0) {
                y_limit = pre_calculation.y.negative
                continue
            }
            this.draw_line(
                ctx,
                {
                    x: 0,
                    y:
                        origin.y +
                        cell_size * Math.sign(y) * Math.abs(Math.abs(y) - y_limit + extra_positive + extra_negative),
                },
                {
                    x: this.props.grid.grid_width,
                    y:
                        origin.y +
                        cell_size * Math.sign(y) * Math.abs(Math.abs(y) - y_limit + extra_positive + extra_negative),
                }
            )
            this.DEBUG_COUNT += 1
        }

        extra_negative = pre_calculation.x.negative < 0 ? pre_calculation.x.negative + 5 : 0
        extra_positive = pre_calculation.x.positive < 0 ? pre_calculation.x.positive + 5 : 0
        var x_limit = pre_calculation.x.negative
        // X-Axis
        for (var x = -pre_calculation.x.negative; x <= pre_calculation.x.positive; x++) {
            if (x === 0) {
                x_limit = pre_calculation.x.positive
                continue
            }
            this.draw_line(
                ctx,
                {
                    x:
                        origin.x +
                        cell_size * Math.sign(x) * Math.abs(Math.abs(x) - x_limit + extra_positive + extra_negative),
                    y: 0,
                },
                {
                    x:
                        origin.x +
                        cell_size * Math.sign(x) * Math.abs(Math.abs(x) - x_limit + extra_positive + extra_negative),
                    y: this.props.grid.grid_height,
                }
            )
            this.DEBUG_COUNT += 1
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

    //
    draw_line(ctx, move_to, line_to) {
        ctx.beginPath()
        ctx.moveTo(move_to.x, move_to.y)
        ctx.lineTo(line_to.x, line_to.y)
        ctx.stroke()
    }

    //
    draw_axis(ctx) {
        ctx.lineWidth = 2
        ctx.strokeStyle = 'black'
        this.draw_line(
            ctx,
            { x: this.props.grid.origin.x, y: 0 },
            { x: this.props.grid.origin.x, y: this.props.grid.grid_height }
        )
        this.draw_line(
            ctx,
            { x: 0, y: this.props.grid.origin.y },
            { x: this.props.grid.grid_width, y: this.props.grid.origin.y }
        )
    }

    render() {
        return (
            <div>
                <Hoverer />
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

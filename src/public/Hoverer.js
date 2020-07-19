import React, { Component } from 'react'
import './css/Hoverer.css'
import { give_cell } from '../private/actions/GridActionCreator'
import { connect } from 'react-redux'

class Hoverer extends Component {
    constructor(props) {
        super(props)
        this.canvas_ref = React.createRef()
        this.decaying_hovers = this.decaying_hovers.bind(this)
        this.N = 0
        this.hover_colours = ['purple', 'blue', 'green', 'yellow', 'orange', 'red']
        this.colour_index = 0
        this.state = {
            hovered_cells: [],
            persistent_cell: [],
        }
    }

    componentDidMount() {
        this.a_ref = requestAnimationFrame(this.decaying_hovers)
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.a_ref)
    }

    componentDidUpdate(prev_props) {
        if (this.props.moving_mouse_pos != prev_props.moving_mouse_pos) {
            this.detect_cell()
        }
        this.draw_cells()
    }

    decaying_hovers() {
        if (this.state.hovered_cells.length > 0) {
            var hovered_cells = this.state.hovered_cells
            var remove = []
            hovered_cells.forEach((obj, index) => {
                obj.opacity -= 0.04
                if (obj.opacity <= 0) remove.push(index)
            })
            hovered_cells = hovered_cells.filter((_, index) => !remove.includes(index))
            this.setState({ hovered_cells })
        }
        requestAnimationFrame(this.decaying_hovers)
    }

    detect_cell() {
        // For some x, it repeats N times, once for each y. So our indexing is +N
        const x_quad = this.props.moving_mouse_pos.x_wrt_origin > -1 ? 1 : 0
        const y_quad = this.props.moving_mouse_pos.y_wrt_origin > -1 ? 1 : 0
        const cell = {
            x_wrt_origin: this.props.moving_mouse_pos.x_wrt_origin,
            y_wrt_origin: this.props.moving_mouse_pos.y_wrt_origin,
            x_quad,
            y_quad,
            opacity: 1,
        }
        const hovered_cells = this.state.hovered_cells
        hovered_cells.push(cell)
        this.setState({ hovered_cells })
    }

    draw_cells() {
        const canvas = this.canvas_ref.current
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        this.state.hovered_cells.forEach((obj) => {
            ctx.globalAlpha = obj.opacity
            this.draw_cell(ctx, obj, 0, 0, 'black')
            this.draw_cell(ctx, obj, 0, -1, 'black')
            this.draw_cell(ctx, obj, 0, 1, 'black')
            this.draw_cell(ctx, obj, -1, 0, 'black')
            this.draw_cell(ctx, obj, +1, 0, 'black')
        })
    }

    draw_cell(ctx, obj, x_offset, y_offset, style) {
        ctx.fillStyle = style
        ctx.fillRect(
            this.props.grid.origin.x -
                (parseInt(obj.x_wrt_origin / this.props.grid.cell_info.cell_size) + obj.x_quad + x_offset) *
                    this.props.grid.cell_info.cell_size,
            this.props.grid.origin.y -
                (parseInt(obj.y_wrt_origin / this.props.grid.cell_info.cell_size) + obj.y_quad + y_offset) *
                    this.props.grid.cell_info.cell_size,
            this.props.grid.cell_info.cell_size,
            this.props.grid.cell_info.cell_size
        )
    }

    render() {
        return (
            <canvas
                ref={this.canvas_ref}
                width={this.props.grid.grid_width}
                height={this.props.grid.grid_height}
                className='hovering_grid'
            />
        )
    }
}

const mapStateToProps = (state) => ({
    grid: state.grid_cell,
    moving_mouse_pos: state.mouse.mouse_pos,
    mouse_left_click: state.mouse.mouse_left_click,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Hoverer)

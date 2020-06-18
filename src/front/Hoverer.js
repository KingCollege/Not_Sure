import React, { Component } from "react";
import "./css/Hoverer.css";

export default class Hoverer extends Component {
  constructor(props) {
    super(props);
    this.canvas_ref = React.createRef();
    this.decaying_hovers = this.decaying_hovers.bind(this);
    this.N = 0;
    this.hover_colours = ['purple', 'blue', 'green', 'yellow', 'orange', 'red'];
    this.colour_index = 0;
    this.state = {
      cells_quad: [],
      hovered_cells: [],
      cell_size: 0,
      window_width: 1980,
      window_height: 1024,
      origin: {
        x: 0,
        y: 0,
      },
      last_mouse: { x: 0, y: 0 },
      canvas_offset: {
        x: 0, y: 0
      },
    };
  }

  componentDidMount() {
    this.a_ref = requestAnimationFrame(this.decaying_hovers);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.a_ref);
  }

  async componentDidUpdate(prev_props) {
    if (this.props != prev_props) {
      await this.setState({ ...this.props });
      this.detect_hover_quadrant(this.state.last_mouse);
    }
    this.draw_cell();
  }

  decaying_hovers() {
    if (this.state.hovered_cells.length > 0) {
      var hovered_cells = this.state.hovered_cells;
      var remove = [];
      hovered_cells.forEach((obj, index) => {
        obj.cell.opacity -= 0.04;
        if (obj.cell.opacity <= 0) remove.push(index);
      });
      hovered_cells = hovered_cells.filter(
        (_, index) => !remove.includes(index)
      );
      this.setState({ hovered_cells });
    }
    requestAnimationFrame(this.decaying_hovers);
  }

  detect_cell(quadrant, x_wrt_origin, y_wrt_origin, quad) {
    // For some x, it repeats N times, once for each y. So our indexing is +N
    this.find_N(quadrant)
    const offset_x = parseInt(x_wrt_origin / this.state.cell_size);
    const offset_y = parseInt(y_wrt_origin / this.state.cell_size);
    const index = Math.abs(this.N * offset_x) + Math.abs(offset_y);
    const hovered = { cell: quadrant[index], index, quad };

    if (quadrant[index].opacity <= 0) {
      quadrant[index].opacity = 1;
      const hovered_cells = this.state.hovered_cells;
      hovered_cells.push(hovered);
      this.setState({ hovered_cells });
    }
  }

  find_N(quadrant) {
    var temp = quadrant[0].x;
    for(var i = 1; i < quadrant.length; i++){
      if(temp != quadrant[i].x){
        this.N = i;
        break;
      }
    }
  }

  draw_cell() {
    const canvas = this.canvas_ref.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'orange';
    this.state.hovered_cells.forEach((obj) => {
      ctx.globalAlpha = obj.cell.opacity;
      ctx.fillRect(
        obj.cell.x + (this.state.canvas_offset.x),
        obj.cell.y + (this.state.canvas_offset.y),
        this.state.cell_size,
        this.state.cell_size
      );
    });
  }

  detect_hover_quadrant(last_mouse) {
    const x_wrt_origin = parseInt((this.state.origin.x - last_mouse.x) + (this.state.canvas_offset.x));
    const y_wrt_origin = parseInt((this.state.origin.y - last_mouse.y) + (this.state.canvas_offset.y));
    const x_quad = x_wrt_origin > -1 ? -1 : 1;
    const y_quad = y_wrt_origin > -1 ? 1 : -1;
    if (x_quad === -1 && y_quad === 1) {
      this.detect_cell(this.state.cells_quad[0], x_wrt_origin, y_wrt_origin, 0);
    } else if (x_quad === 1 && y_quad === 1) {
      this.detect_cell(this.state.cells_quad[1], x_wrt_origin, y_wrt_origin, 0);
    } else if (x_quad === 1 && y_quad === -1) {
      this.detect_cell(this.state.cells_quad[2], x_wrt_origin, y_wrt_origin, 0);
    } else if (x_quad === -1 && y_quad === -1) {
      this.detect_cell(this.state.cells_quad[3], x_wrt_origin, y_wrt_origin, 0);
    }
  }

  render() {
    return (
      <canvas
        ref={this.canvas_ref}
        width={this.state.window_width}
        height={this.state.window_height}
        className="hovering_grid"
      />
    );
  }
}

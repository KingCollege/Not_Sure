import React, { Component } from "react";
import "./css/GraphVisual.css";
import Hoverer from "./Hoverer";

export default class GraphVisual extends Component {
  constructor(props) {
    super(props);
    this.canvas_ref = React.createRef();
    this.x_offset = 0;
    this.y_offset = 0;
    this.hovering_cells = [];
    this.grid_edge = {
      top: { y: 0, x: 0 },
      bottom: { y: 0, x: 0 },
      left: { y: 0, x: 0 },
      right: { y: 0, x: 0 },
    };
    this.window_width = 1980;
    this.window_height = 1024;
    this.state = {
      cell_info: {
        cell_color: "#4397AC",
        stroke_color: "grey",
        stroke_width: "1",
        cell_size: 25,
        const_cell_size: 25,
        enlargement: 4,
      },
      last_mouse: {
        x_wrt_canvas: 0,
        y_wrt_canvas: 0,
        x: 0,
        y: 0,
      },
      last_clicked: {
        x: 0,
        y: 0,
      },
      canvas_selected: false,
      origin: {
        x: 1980 / 2,
        y: 1024 / 2,
      },
      canvas_offset: { x: 0, y: 0 },
    };
  }

  componentDidMount() {
    this.draw_cells();
    console.log(this.window_height);
    console.log(this.window_width);
  }

  componentWillUnmount() {
    console.log("unmounted");
  }

  componentDidUpdate() {}

  mouse_move(event) {
    const last_mouse = this.state.last_mouse;
    last_mouse.x = event.clientX;
    last_mouse.y = event.clientY;
    last_mouse.x_wrt_canvas = event.clientX / this.state.cell_info.cell_size;
    last_mouse.y_wrt_canvas = event.clientY / this.state.cell_info.cell_size;
    this.setState({ last_mouse });
    // When canvas selected, translate it w.t.r mouse position since last clicked
    // + the current x and y of canvas, parsed because its stored as string
    if (this.state.canvas_selected) {
      this.translation(event, last_mouse);
    }
  }

  mouse_down() {
    const last_clicked = {
      x: this.state.last_mouse.x,
      y: this.state.last_mouse.y,
    };
    this.setState({ canvas_selected: true, last_clicked });
  }

  mouse_up(event) {
    const last_clicked = {
      x: this.state.last_mouse.x,
      y: this.state.last_mouse.y,
    };
    // Set offset as default position of canvas
    event.target.style.x = this.x_offset;
    event.target.style.y = this.y_offset;
    const canvas_offset = this.state.canvas_offset;
    canvas_offset.x = this.x_offset;
    canvas_offset.y = this.y_offset;
    this.setState({ canvas_selected: false, last_clicked, canvas_offset });
  }

  translation(event, last_mouse) {
    this.x_offset =
      last_mouse.x - this.state.last_clicked.x + (event.target.style.x ? parseInt(event.target.style.x) : 0);
    this.y_offset =
      last_mouse.y - this.state.last_clicked.y + (event.target.style.y ? parseInt(event.target.style.y) : 0);
    event.target.style.transform = `translate(` + this.x_offset + `px,` + this.y_offset + `px)`;
  }

  scroll_zoom(event) {
    if (event.deltaY > 0) {
      this.zoom(-1);
    } else {
      this.zoom(1);
    }
    this.redraw_all();
  }

  zoom(dir) {
    var cell_info = this.state.cell_info;
    cell_info.cell_size = cell_info.cell_size + dir;
    if (cell_info.cell_size > cell_info.const_cell_size * 2) {
      cell_info.cell_size = cell_info.const_cell_size;
    }
    if (cell_info.cell_size < cell_info.const_cell_size / 2) {
      cell_info.cell_size = cell_info.const_cell_size;
    }
    this.setState({
      cell_info,
    });
  }

  redraw_all() {
    const canvas = this.canvas_ref.current;
    const ctx = canvas.getContext("2d");
    ctx.setTransform();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.draw_cells();
    this.draw_axis(ctx);
  }

  draw_cells() {
    const canvas = this.canvas_ref.current;
    const ctx = canvas.getContext("2d");
    this.hovering_cells = [];
    //Clockwise Quadrants: DO NOT CHANGE
    this.draw_quadrant(ctx, { x: 0, y: 0 }); //0
    this.draw_quadrant(ctx, { x: this.window_width, y: 0 }); //1
    this.draw_quadrant(ctx, { x: this.window_width, y: this.window_height }); //2
    this.draw_quadrant(ctx, { x: 0, y: this.window_height }); //3
    this.draw_axis(ctx);
  }

  // origin_pos = (0,0) w.r.t screen
  draw_quadrant(ctx, quad_limit) {
    this.hovering_cells.push([]);
    const x_incr = this.state.origin.x > quad_limit.x ? -1 : 1;
    const y_incr = this.state.origin.y > quad_limit.y ? 1 : -1;
    const wrt_cell = {
      x: this.state.origin.x / this.state.cell_info.cell_size + (x_incr > 0 ? 0 : -1),
      y: this.state.origin.y / this.state.cell_info.cell_size + (y_incr > 0 ? -1 : 0),
      width: quad_limit.x / this.state.cell_info.cell_size + (x_incr > 0 ? 0 : -1),
      height: quad_limit.y / this.state.cell_info.cell_size + (y_incr < 0 ? 0 : -1),
    };
    ctx.fillStyle = this.state.cell_info.cell_color;
    ctx.strokeStyle = this.state.cell_info.stroke_color;
    // Multiply by -1 we can switch the inequality

    for (var x = wrt_cell.x; x * x_incr < wrt_cell.width * x_incr; x += x_incr) {
      for (var y = wrt_cell.y; y * y_incr > wrt_cell.height * y_incr; y -= y_incr) {
        ctx.lineWidth = 0.75;
        ctx.strokeRect(
          x * this.state.cell_info.cell_size,
          y * this.state.cell_info.cell_size,
          this.state.cell_info.cell_size,
          this.state.cell_info.cell_size
        );
        this.hovering_cells[this.hovering_cells.length - 1].push({
          x: x * this.state.cell_info.cell_size,
          y: y * this.state.cell_info.cell_size,
          opacity: 0,
        });
      }
    }
  }

  draw_axis(ctx) {
    const mid_x = this.window_width / 2;
    const mid_y = this.window_height / 2;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(mid_x, 0);
    ctx.lineTo(mid_x, this.window_height);
    ctx.stroke();
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(0, mid_y);
    ctx.lineTo(this.window_width, mid_y);
    ctx.stroke();
    ctx.strokeStyle = this.state.cell_info.stroke_color;
  }

  render() {
    return (
      <div>
        <Hoverer
          cells_quad={this.hovering_cells}
          cell_size={this.state.cell_info.cell_size}
          origin={this.state.origin}
          last_mouse={this.state.last_mouse}
          window_height={this.window_height}
          window_width={this.window_width}
          canvas_offset={this.state.canvas_offset}
        />
        <canvas
          ref={this.canvas_ref}
          width={this.window_width}
          height={this.window_height}
          className="main-canvas"
          onContextMenu={(e) => {
            e.preventDefault(); // disables default browser behaviour
            // right click gives context menu
          }}
          onWheel={this.scroll_zoom.bind(this)}
          onMouseMove={this.mouse_move.bind(this)}
          onMouseDown={this.mouse_down.bind(this)}
          onMouseUp={this.mouse_up.bind(this)}
          onMouseLeave={this.mouse_up.bind(this)}
        />
      </div>
    );
  }
}

import React, { Component } from "react";
import "./css/Settings.css";

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.x_offset = 0;
    this.y_offset = 0;
    this.state = {
      last_mouse: {
        x: 0,
        y: 0,
      },
      last_clicked: {
        x: 0,
        y: 0,
      },
      selected: false,
    };
  }

  mouse_move(event) {
    const last_mouse = this.state.last_mouse;
    last_mouse.x = event.clientX;
    last_mouse.y = event.clientY;
    this.setState({ last_mouse });
    if (this.state.selected) {
      this.x_offset =
        last_mouse.x -
        this.state.last_clicked.x +
        (event.target.style.x ? parseInt(event.target.style.x) : 0);
      this.y_offset =
        last_mouse.y -
        this.state.last_clicked.y +
        (event.target.style.y ? parseInt(event.target.style.y) : 0);
      event.target.style.transform =
        `translate(` + this.x_offset + `px,` + this.y_offset + `px)`;
    }
  }

  mouse_down() {
    const last_clicked = {
      x: this.state.last_mouse.x,
      y: this.state.last_mouse.y,
    };
    this.setState({ selected: true, last_clicked });
  }

  mouse_up(event) {
    const last_clicked = {
      x: this.state.last_mouse.x,
      y: this.state.last_mouse.y,
    };
    // Set offset as default position of canvas
    event.target.style.x = this.x_offset;
    event.target.style.y = this.y_offset;
    this.setState({ selected: false, last_clicked });
  }

  render() {
    return (
      <div
        className="controller-container"
        onMouseMove={this.mouse_move.bind(this)}
        onMouseDown={this.mouse_down.bind(this)}
        onMouseUp={this.mouse_up.bind(this)}
        onMouseLeave={this.mouse_up.bind(this)}
      ></div>
    );
  }
}

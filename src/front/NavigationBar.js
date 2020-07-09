import React, { Component } from "react";
import Settings from "./Settings";
import "./css/NavigationBar.css";

export default class NavigationBar extends Component {
  render() {
    return (
      <div className="navigation-container">
        <div className="links">
          Home
        </div>
        <Settings />
      </div>
    );
  }
}
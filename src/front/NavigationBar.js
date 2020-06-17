import React, { Component } from "react";
import Settings from "./Settings";
import "./css/NavigationBar.css";

export default class NavigationBar extends Component {
  render() {
    return (
      <div className="navigation-container">
        <div className="home">
          <Settings />
        </div>
        <div className="logo">G</div>
      </div>
    );
  }
}

import React, { Component } from 'react'
import { GraphVisual, NavigationBar } from './public/index'
import './App.css'

export default class App extends Component {
    render() {
        return (
            <div className='app'>
                <GraphVisual />
                <NavigationBar />
            </div>
        )
    }
}

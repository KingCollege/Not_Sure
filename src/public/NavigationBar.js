import React, { Component } from 'react'
import Settings from './Settings'
import './css/NavigationBar.css'
import { AiFillHome } from 'react-icons/ai'

export default class NavigationBar extends Component {
    render() {
        return (
            <div className='navigation-container'>
                <div className='links'>
                    <AiFillHome size={15} />
                    Home
                </div>
                {/* <Settings /> */}
            </div>
        )
    }
}

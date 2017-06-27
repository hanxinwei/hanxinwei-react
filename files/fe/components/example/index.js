import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styles from './index.css';

class Example extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div style={{fontSize:'50px',textAlign:'center'}} >Example</div>
        );
    }
}

export { Example as default }

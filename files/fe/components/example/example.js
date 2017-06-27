import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import '../../shared-css/reset.css';
import commonStyles from '../../shared-css/common.css';
import styles from './index.css';
import Example from './index';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { styles }
    }
    render() {
        return (
            <Example />
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);

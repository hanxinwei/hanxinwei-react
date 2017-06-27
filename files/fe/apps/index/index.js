import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import '../../shared-css/reset.css';
import commonStyles from '../../shared-css/common.css';
import styles from './index.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { styles }
    }
    render() {
        return (
            <div>
                <div style={{ fontSize: '50px', textAlign: 'center' }} >index </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);





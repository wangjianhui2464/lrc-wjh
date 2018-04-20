import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import Routes from './routes';

class App extends React.PureComponent {
  render() {
    return (
      <div className="rootDiv">
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ border: 'green solid 2px' }}>
              这是标题栏
            </div>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ border: 'red solid 2px', flex: 1 }}>
                <span>这边就是列表</span>
                <ul>
                  <li><Link to="/">Home</Link></li>
                  <li><Link to="/dropdown">DropDown</Link></li>
                  <li><Link to="/lazyload">Lazyload</Link></li>
                </ul>
              </div>
              <div style={{ border: 'blue solid 2px', flex: 4 }}>
                <span>这边就是例子了</span>
                <Routes />
              </div>
            </div>
          </div>
        </Router>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));

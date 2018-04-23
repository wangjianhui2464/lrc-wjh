import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import Routes from './routes';

class App extends React.PureComponent {
  render() {
    return (
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ border: 'green solid 2px', minHeight: '9vh' }}>
            <Link to="/">Home</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>

            <div
              style={{
                display: 'flex', border: 'red solid 2px', flex: 1, flexDirection: 'column',
              }}
            >
              <h3>这边就是列表</h3>
              <ul>
                <li>
                  <Link to="/dropdown">DropDown</Link>
                </li>
                <li><Link to="/lazyload">Lazyload</Link></li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              border: 'blue solid 2px',
              flex: 4,
              minHeight: '90vh',
              flexDirection: 'column',
            }}
            >
              <h3>这边就是例子了</h3>
              <Routes />
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

render(<App />, document.getElementById('root'));

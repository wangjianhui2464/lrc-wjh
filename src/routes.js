/**
 * Created by Dennis Wang
 * on 2018/4/20 0020 16:12
 */
import React from 'react';
import { Route } from 'react-router-dom';

import DropdownExample from './example/dropdown.example';

const Routes = () => (
  <div>
    <Route
      exact
      path="/"
      render={() => (
        <div>
            这是 react 组件库
        </div>
        )
      }
    />
    <Route path="/dropdown" component={DropdownExample} />
    <Route path="/lazyload" component={DropdownExample} />
  </div>
);


export default Routes;

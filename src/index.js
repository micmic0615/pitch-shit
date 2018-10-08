import "Assets/scripts/processGlobals.js";
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import store, { history } from './store';

import App from './app.js'

import 'Assets/css/main.scss';

const target = document.querySelector('#root');

render(<Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route path='/' component={App} />
      </Switch>
    </ConnectedRouter>
  </Provider>,
target);
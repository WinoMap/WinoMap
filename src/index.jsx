import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware} from 'redux';
import apiMiddleware from './apiMiddleware';
import {Provider} from 'react-redux';
import reducer from './reducer';
import {Map, List} from 'immutable';
import {ChartContainer} from './components/Chart';

const createStoreWithMiddleware = applyMiddleware(apiMiddleware)(createStore);
const store = createStoreWithMiddleware(reducer);

const options = Map({
        precisionMode: "point",
        precision: 0.9,
        plan: "bat_c",
        scale: Map({
          ratio: List.of(1,1),
          offset: List.of(0,0)
        })
    });

//TODO: manage with store.getState if we are in circle or point mode for the API request
store.dispatch({type: 'SET_OPTIONS', options: options});

setInterval(() => {
  store.dispatch({type: 'API_REQUEST'})
}, 5000);

ReactDOM.render(
	<Provider store={store}>
		<ChartContainer />
	</Provider>,
	document.getElementById('app')
);
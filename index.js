import makeStore from './src/store';
import {Map, List} from 'immutable';

import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import io from 'socket.io-client';
import reducer from './reducer';
import {setState} from './action_creators';
import remoteActionMiddleware from './remote_action_middleware';
import {LocalizationContainer} from './components/Localization';

export const store = makeStore();
var winos = List.of(
	Map({
		"id": 8,
		"x":8,
		"y":8,
		"movable": false
	}),
	Map({
		"id": 2,
		"x":2,
		"y":2,
		"movable": true
}));


let unsuscribe = store.suscribe(() =>
	console.log(store.getState())
);
store.dispatch({
	type: 'SET_WINOS',
	winos: winos
});
store.dispatch({type: 'SET_MOVABLE', id:1})

ReactDOM.render(
	<Provider store={store}>
		<LocalizationContainer />
	</Provider>,
	document.getElementById('app')
);
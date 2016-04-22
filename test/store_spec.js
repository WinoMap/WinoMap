import {Map, List, fromJS} from 'immutable';
import {expect} from 'chai';
import makeStore from '../src/store';

describe('store', () => {
	it('is a redux store configured with the correct reducer', () => {
		const store = makeStore();
		expect(store.getState()).to.equal(Map({
			winos: List(),
			options: Map(),
	        event: Map()
		}));

		store.dispatch({
			type: 'SET_WINOS',
			winos: List.of(
				        Map({
				          id: 3,
				          x:3,
				          y:3,
				          movable: false
				        }),
				        Map({
				          id: 4,
				          x:4,
				          y:4,
				          movable: false
				        })
			      	)
		});
		expect(store.getState()).to.equal(Map({
	        winos: List.of(
	          Map({
	            id: 3,
	            x:3,
	            y:3,
	            movable: false
	          }),
	          Map({
	            id: 4,
	            x:4,
	            y:4,
	            movable: false
	          })
	        ),
	        options: Map(),
	        event: Map()
	    }));
	});
});
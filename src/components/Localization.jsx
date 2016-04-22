import React from 'react';
import {Map, List} from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {connect} from 'react-redux';
import * as actionCreators from '../action_creators';

export const Localization = React.createClass({
	mixins: [PureRenderMixin],
	changeWinoCoordinates: function() {
		return 1;
	},
	getWinos: function() {
		return this.props.winos || []
	},
	render: function() {
		/*const newWino = Map({
			id: 9,
			x: 1,
			y: 2,
			main: false
		})

		const newWinos = List.of(
		  Map({
		    id: 1,
		    x:50,
		    y:25,
		    main: false
		  }),
		  Map({
		    id: 2,
		    x:2,
		    y:2,
		    main: false
		  })
		);*/

		return <div className="localization">
			{this.getWinos().map(wino =>
				<h1>id : {wino.get('id')}<br/>
					x: {wino.get('x')}<br/>
					y: {wino.get('y')}<br/>
					main: {wino.get('main')}<br/>
				</h1>
			)}
		</div>;
	}
});

function mapStateToProps(state) {
	return {
		winos: state.get('winos')
	};
}

export const LocalizationContainer = connect(mapStateToProps, actionCreators)(Localization);
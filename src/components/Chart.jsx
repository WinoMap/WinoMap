import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {Map, List} from 'immutable';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {createD3Chart, updateD3Chart} from '../d3Chart';
import * as actionCreators from '../action_creators';

//const d3Chart = require('../d3Chart');

export const Chart = React.createClass({
  mixins: [PureRenderMixin],
  componentDidMount: function() {
    var el = ReactDOM.findDOMNode(this);
    createD3Chart(el, {}, this.getChartState());
  },

  componentDidUpdate: function() {
    if(this.props.options.getIn(['scale','ratio']) != [1,1]){
      var el = ReactDOM.findDOMNode(this);
      updateD3Chart(el, this.getChartState());
    }
  },

  getWinos: function() {
    return this.props.winos || []
  },

  getEvents: function() {
    return this.props.event || {}
  },

  getOptions: function() {
    return this.props.options || {}
  },

  getMainWinos: function() {
    let result = [];
    for(var i=0; i<this.getWinos().size; i++){
      if(this.getWinos().get(i).get('main') == true){
        result.push(this.getWinos().get(i));
      }
    }
    return result;
  },

  getAnchorWinos: function() {
    let result = [];
    for(var i=0; i<this.getWinos().size; i++){
      if(this.getWinos().get(i).get('main') == false){
        result.push(this.getWinos().get(i));
      }
    }
    return result;
  },

  getPrecision: function(){
    return this.props.options.get('precision') || 1;
  },

  isScaleDefined: function(){

    //Can't compare this.props.options.getIn(['scale', 'ratio']) == [1,1], why ?
    if(this.props.options.getIn(['scale', 'ratio','0']) == 1
      && this.props.options.getIn(['scale', 'ratio','1']) == 1){
      return false;
    }else{
      return true;
    }
  },

  getChartState: function() {
    return {
      //Warning, precisionDifference only translate by the X ratio
      mainWinos: this.getMainWinos(),
      onMapClick: this.props.setEventData,
      options: this.getOptions(),
      anchorWinos: this.getAnchorWinos(),
      event: this.getEvents(),
      precision: this.getPrecision(),
      isScaleDefined: this.isScaleDefined()
    };
  },

  //Generate the buttons of the menu
  getButtons: function(){
    if(this.getEvents() != {}){
      if(this.getEvents().get('type') == 'scale'){
        //If we are using the Scale tool
        if(this.getEvents().get('data').get('secondPoint') != ''){
          //If the second point is placed
          const firstPoint = this.getEvents().getIn(['data','firstPoint']);
          const secondPoint = this.getEvents().getIn(['data','secondPoint']);
          return (<button onClick={() => this.props.setScale(firstPoint, secondPoint)}>Confirm Scale</button>);
        }
      }
    }
  },

  render: function() {
    return (
      <div app_container>
        <div buttonContainer>
          <button onClick={() => this.props.togglePrecision()}>DisplayMode Toggle</button>
          <button onClick={() => this.props.eventStart('scale')}>Scale tool</button>
              {this.getButtons()}
        </div>
        <div className="Chart">
        </div>
      </div>
    );
  }
});

function mapStateToProps(state) {
  return {
    winos: state.get('winos'),
    options: state.get('options'),
    event: state.get('event')
  };
}

export const ChartContainer = connect(mapStateToProps, actionCreators)(Chart);
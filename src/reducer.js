import { combineReducers } from 'redux';
import {Map, List} from 'immutable';
import {setWinos, addWino, delWino, moveWino, setMainWino, setAnchorWino,
togglePrecision, setScale, setOptions, apiRequest,
setEvent, setEventData, eventStart } from './core';

function winos(state = List(), action, optionState){
  switch(action.type){
    case 'SET_WINOS':
      return setWinos(state, action.winos, optionState.get('scale'));
    case 'ADD_WINO':
      return addWino(state, action.wino);
    case 'DEL_WINO':
      return delWino(state, action.id);
    case 'MOVE_WINO':
      return moveWino(state, action.id, action.x, action.y, optionState.get('scale'));
    case 'SET_MAIN_WINO':
      return setMainWino(state, action.id);
    case 'SET_ANCHOR_WINO':
      return setAnchorWino(state, action.id);
  }
  return state;
}

function options(state = Map(), action){
  switch(action.type){
    case 'SET_OPTIONS':
      return setOptions(state, action.options);
    case 'TOGGLE_PRECISION':
      return togglePrecision(state);
    case 'SET_SCALE':
      return setScale(state, action.firstPoint, action.secondPoint);
  }
  return state;
}

function event(state = Map(), action){
  switch(action.type){
    case 'SET_EVENT_DATA':
      return setEventData(state, action.action);
    case 'EVENT_START':
      return eventStart(state, action.eventType);

    //
    case 'SET_SCALE':
      return setEventData(state, {type: 'NONE'});
  }
  return state;
}

export default function reducer(state = Map(), action) {
  return Map({
    options: options(state.get('options'), action),
    event: event(state.get('event'), action),
    winos: winos(state.get('winos'), action, state.get('options'))
  });
}
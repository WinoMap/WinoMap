import {List, Map} from 'immutable';
import {expect} from 'chai';
import {
setWinos, addWino, moveWino, delWino, setMainWino,
togglePrecision, setScale,
setEvent, setEventData, eventStart
} from '../src/core';

describe('application logic', () => {
  describe('winos', () => {
    const winoState = List.of(
        Map({
          id: 1,
          x:1,
          y:1,
          main: false
        }),
        Map({
          id: 2,
          x:2,
          y:2,
          main: false
        })
    );

    describe('setWinos', () => {
      it('replace the list of winos', () => {
        const winos = List.of(
          Map({
            id: 3,
            x:3,
            y:3,
            main: false
          }),
          Map({
            id: 4,
            x:4,
            y:4,
            main: false
          })
        );
        const nextState = setWinos(winoState, winos);
        expect(nextState).to.equal(List.of(
            Map({
              id: 3,
              x:3,
              y:3,
              main: false
            }),
            Map({
              id: 4,
              x:4,
              y:4,
              main: false
            })
          ));


      });
    });
    describe('addWino', () => {
      it('adds a Wino', () => {

        const wino = Map({
          id: 5,
          x:5,
          y:5,
          main: false
        });

        const nextState = addWino(winoState, wino);
        expect(nextState).to.equal(List.of(
            Map({
              id: 1,
              x:1,
              y:1,
              main: false
            }),
            Map({
              id: 2,
              x:2,
              y:2,
              main: false
            }),
            Map({
              id: 5,
              x:5,
              y:5,
              main: false
            })
          ));

      });
    });
    describe('delWino', () => {
      it('deletes a wino', () => {
        const idToDelete = 1;
        const nextState = delWino(winoState, idToDelete);
        expect(nextState).to.equal(List.of(
          Map({
            id: 2,
            x:2,
            y:2,
            main: false
          })
        ));
      });
    });
    describe('moveWino', () => {
      it('moves a wino', () => {
        const x = 50, y = 25, idToMove = 1;
        const nextState = moveWino(winoState, idToMove, x, y);
        expect(nextState).to.equal(List.of(
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
        ));

      });
    });
    describe('setMainWino', () => {
      it('set Main wino by setting others to false', () => {
        const state = Map({
          winos: List.of(
            Map({
              id: 1,
              x:1,
              y:1,
              main: false
            }),
            Map({
              id: 2,
              x:2,
              y:2,
              main: true
            })
          )
        });
        const idToMove = 1;
        const nextState = setMainWino(winoState, idToMove);
        expect(nextState).to.equal(List.of(
          Map({
            id: 1,
            x:1,
            y:1,
            main: true
          }),
          Map({
            id: 2,
            x:2,
            y:2,
            main: false
          })
        ));

      });
    });
  });

  //togglePrecision, uploadPlan, setScale
  describe('options', () => {
    const optionState = Map({
        precisionMode: "point",
        precision: 0.2,
        plan: "bat_c",
        scale: Map({
          ratio: List.of(2,3),
          offset: List.of(4,5)
        })
    });

    describe('togglePrecision', () => {
      it('changes the precision mode', () => {
        const nextState = togglePrecision(optionState);
        expect(nextState).to.equal(Map({
          precisionMode: "circle",
          precision: 0.2,
          plan: "bat_c",
          scale: Map({
            ratio: List.of(2,3),
            offset: List.of(4,5)
          })
        }));


      });
    });

    /*
    describe('setScale', () => {
      it('changes the scale', () => {
        const scaleX = 4, scaleY = 5;
        const nextState = setScale(optionState, scaleX, scaleY);
        expect(nextState).to.equal(Map({
          precisionMode: "point",
          plan: "bat_c",
         scale: Map({
          ratio: List.of(2,3);
          offset: List.of(4,5);
        })
        }));


      });
    });*/
  });

  describe('Event', () => {
    const EventState = Map({
      type: 'none',
      data: Map()
    });

    describe('eventStart', () => {
      it('Initialise the event values', () => {
        const event = 'scale';
        const nextState = eventStart(EventState, event);
        expect(nextState).to.equal(Map({
            type: 'scale',
            data: Map({
              firstPoint: '',
              secondPoint: ''
            })
          })
        );

      });
    });

    describe('setEventData', () => {
      it('changes the current event datas', () => {
        const event = 'scale';
        const nextState = eventStart(EventState, event);

        var action = {type: 'MAP_CLICK', x: 80, y: 180};
        const afterState = setEventData(nextState, action);
        expect(afterState).to.equal(Map({
            type: 'scale',
            data: Map({
              firstPoint: List.of(80,180),
              secondPoint: ''
            })
          })
        );

        action = {type: 'MAP_CLICK', x: 70, y: 190};
        const againAfterState = setEventData(afterState, action);
        expect(againAfterState).to.equal(Map({
            type: 'scale',
            data: Map({
              firstPoint: List.of(80,180),
              secondPoint: List.of(70,190)
            })
          })
        );

      });
    });

  });

});
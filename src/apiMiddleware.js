import http from 'http';
import {fromJS} from 'immutable';
//var http = require('http');

/**
* Make the request to update mainWino
* @param: state Map store the state of the application
*/
export default store => next => action => {
    //If the action intercepted is the API call
    switch(action.type){
        case 'API_REQUEST':
        	let x;
        	let y;
            let tuple;

            var options = {
            	host: 'localhost:8042',
            	path: '/'
            };
            var callback = function(response) {
            	var str = '';
            	response.on('data', function(chunk) {
            		str += chunk;
            	});
            	response.on('end', function(){
            		tuple = JSON.parse(str);
                    x = tuple[0];
                    y = tuple[1];
                    return next({type: 'MOVE_WINO', id: 1, x: x, y: y})
            	});
            }

            http.request(options, callback).end();
            break;
        case 'SET_SCALE':
            //If the scale changes, we fetch again the data and translate them.
            var options = {
                host: 'localhost:8042',
                path: '/init/'
            };
            var callback = function(response) {
                var str = '';
                response.on('data', function(chunk) {
                    str += chunk;
                });
                response.on('end', function(){
                    let winos = fromJS(JSON.parse(str));
                    return next({type: 'SET_WINOS', winos: winos})
                });
            }

            http.request(options, callback).end();
            break;
    }
    /*console.log('--- middleware ---');
    console.log(action);*/

    return next(action)
}
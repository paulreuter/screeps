/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room.controller');
 * mod.thing == 'a thing'; // true
 */
var actions = require('room.actions');
var conditions = require('room.conditions');

function refreshStateMachine(room)
{
    // note: some states have condition 'TRUE'
    // flags created by an action apparently can't 
    //    be used in the same game tick
    room.memory.state_machine = {
            UNINITIALIZED: [{
                conditions: ['SPAWN_EXISTS'], 
                actions:['INITIALIZE', 'REFRESH_BLUEPRINTS'], 
                next_state:'PREPARE_SOURCES'}],
            PREPARE_SOURCES: [{
                conditions: ['TRUE'],
                actions:['PREPARE_SOURCES'],
                next_state:'MINING_CONTAINERS'}],
            MINING_CONTAINERS: [{
                conditions: ['TRUE'],
                actions:['MINING_CONTAINERS'],
                next_state:'PRIMARY_MINING'}],
            PRIMARY_MINING: [{
                conditions:['ALL_CONSTRUCTION_DONE'], 
                actions:['CONNECT_ALL_SOURCES', 'BASE_CONTAINER', 'START_UPGRADING'], 
                next_state:'PRIMARY_STORAGE' }],
            PRIMARY_STORAGE: [{
                conditions:['ALL_CONSTRUCTION_DONE'],
                actions:['BUILD_CARRIERS'],
                next_state:'RCL_TWO' }],
            RCL_TWO: [{
                conditions: ['RCL_LEVEL_TWO'],
                actions: ['BUILD_EXTENSIONS'],
                next_state:'EXTENSION_TWO'}],
            EXTENSION_TWO: [{
                conditions: ['FIVE_EXTENSIONS_BUILT'],
                actions: ['REFRESH_BLUEPRINTS','BUILD_CONTROLLER_SUPPORT'], 
                next_state: 'CONTROLLER' }],
            CONTROLLER: [{
                conditions: ['ALL_CONSTRUCTION_DONE'], 
                actions: ['BUILD_FORTIFICATIONS', 'USE_STATIONARY_UPGRADER', 'REFRESH_BLUEPRINTS'],
                next_state: 'RCL_LEVEL_THREE' }],
            RCL_THREE: [{
                conditions: ['RCL_LEVEL_THREE'],
                actions: ['BUILD_EXTENSIONS','BUILD_TOWER'],
                next_state:'EXTENSION_THREE'}],
            EXTENSION_THREE: [{
                conditions: ['ALL_CONSTRUCTION_DONE'],
                actions:['REFRESH_BLUEPRINTS'],
                next_state:'WAIT'}],
            WAIT: [{
                conditions: ['MOSTLY_FALSE'],
                actions:['RESET_STATE_MACHINE'],
                next_state:'WAIT'}]
                
    };

}

function evaluateState(room) {
    if( ! room.memory.state_machine)
    {
        if( !room.memory.state ) 
        {
        // actions.INITIALIZE(spawn);
            console.log('Room state not yet set, switching to STATE_UNINITIALIZED');
            room.memory.state = 'UNINITIALIZED';
        }
        refreshStateMachine(room);
    }
    if( Game.time % 1 == 0)
    {
        refreshStateMachine(room);
        var stateTransfers = room.memory.state_machine[room.memory.state];
        for( var i in stateTransfers)
        {
            var myConditions = stateTransfers[i].conditions;
            
            var result = true;
            for( var j in myConditions)
            {
                if( !conditions[myConditions[j]](room))
                {
                    result = false;
                    break;
                }
            }
            if( result)
            {
                var myActions = stateTransfers[i].actions;
                for( var j in myActions)
                {
                    console.log('Executing: '+ myActions[j]);
                    actions[myActions[j]](room);
                }
                if( stateTransfers[i].next_state)
                {
                    console.log( 'Changing state to '+stateTransfers[i].next_state);
                    room.memory.state = stateTransfers[i].next_state;
                }
            }
        }
    }
}


module.exports = {

    run: function(room) {
        evaluateState(room);
    }
};
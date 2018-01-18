/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creep.configuration');
 * mod.thing == 'a thing'; // true
 */
const known_roles = [
    'housekeeper',
    'miner',
    'builder',
    'upgrader',
    'carrier'
]
 
const creepConfigurations = [
    {
        min:300,
        miner: [[WORK,WORK,MOVE, MOVE]],
        builder:[[WORK, WORK, CARRY, MOVE]],
        carrier:[[ CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]],
        upgrader: [[WORK,CARRY,CARRY,MOVE,MOVE], [WORK,CARRY,CARRY,MOVE,MOVE]],
        housekeeper:[[WORK, CARRY,CARRY, MOVE,MOVE]],
    },
    {
        min:550,
        miner: [[WORK,WORK,WORK,WORK, WORK, MOVE]],
        builder:[[WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]],
        carrier:[[ CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]],
        upgrader: [[WORK, WORK, WORK,CARRY, CARRY, CARRY, MOVE, MOVE], [WORK,WORK,WORK,WORK, WORK, MOVE]],
        housekeeper:[[WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]],
    }
    
    ]
    



module.exports = {};

module.exports.refreshConfigurations = function(room)
{
    var i;
    for( i in creepConfigurations)
    {
        if( creepConfigurations[i].min <= room.energyCapacityAvailable)
        {
            continue;
        } else 
        {
            i = i-1;
            break;
        }
    }
    console.log( 'Refreshing blueprints, choosing config: ' +JSON.stringify(creepConfigurations[i]));
    for( var role in known_roles)
    {
        var index = room.memory[known_roles[role]+'_index'];
        if( !index)
            index = 0;
        room.memory[known_roles[role]+'_configuration'] = creepConfigurations[i][known_roles[role]][index];
    }
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        var bodyToTest = JSON.stringify(creep.body.map( (s) =>{ return s.type}));
        var bodyReference = JSON.stringify(room.memory[creep.memory.role+'_configuration']);
        if(! (bodyToTest == bodyReference))
        {
            console.log( 'Obsoleting creep '+ name);
            creep.memory.obsolete = true;
        }
    }

    
}
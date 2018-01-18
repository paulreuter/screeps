var creepController = require('creep.controller');
var roomController = require('room.controller');

function defendRoom(room) {
    var hostiles = room.find(FIND_HOSTILE_CREEPS);
    if(hostiles.length > 0) {
        var username = hostiles[0].owner.username;
        Game.notify(`User ${username} spotted in room ${roomName}`);
        var towers = Game.rooms[roomName].find(
            FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        towers.forEach(tower => tower.attack(hostiles[0]));
    }
}

function destroyAllRampartsWalls(room)
{
    var structures = room.find(FIND_STRUCTURES, {filter: (s)=> {return (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)}});
    structures.forEach((s)=> s.destroy());
    var blueprints = room.find( FIND_MY_CONSTRUCTION_SITES, {filter: (s)=>{return s.structureType== STRUCTURE_WALL || s.structureType ==STRUCTURE_RAMPART}});
    blueprints.forEach((s) => s.remove());
}

module.exports.loop = function () {
    // var bodyToTest = Game.creeps['carrier 114363'].body.map( (s) =>{ return s.type});
    // console.log( JSON.stringify(bodyToTest));
    // var referenceBody = [ CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
    // console.log( JSON.stringify(referenceBody));
    // console.log( JSON.stringify(bodyToTest) === JSON.stringify(referenceBody));
    
    var spawn = Game.spawns['Spawn1'];
    // findExit( spawn);
    creepController.run(spawn);
    roomController.run(spawn.room);
    defendRoom(spawn.room);
    // var creepConf = require('creep.configuration');
    // creepConf.refreshConfigurations(spawn.room);
//     const actions = require('room.actions');
//     if( ! spawn.room.memory.buildwalls)
//     {
//         actions.BUILD_FORTIFICATIONS(spawn.room);
//         spawn.room.memory.buildwalls = true;
//     }
    // destroyAllRampartsWalls(spawn.room);
}

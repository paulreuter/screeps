var creepController = require('creep.controller');
var roomController = require('room.controller');

function defendRoom(room) {
    var hostiles = room.find(FIND_HOSTILE_CREEPS);
    if(hostiles.length > 0) {
        var username = hostiles[0].owner.username;
        Game.notify('User '+username+ 'spotted in room '+room.name);
        var towers = room.find(
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

    var spawn = Game.spawns['Spawn1'];
    creepController.run(spawn);
    roomController.run(spawn.room);
    defendRoom(spawn.room);
    
    // var exit = spawn.pos.findClosestByPath(FIND_EXIT_RIGHT, {ignoreCreeps: true});
    // console.log( 'Found exit '+JSON.stringify(exit));
    // var existingRamparts = exit.findInRange( FIND_STRUCTURES, 100,{filter:(s) => { return s.structureType == STRUCTURE_RAMPART}});
    // console.log( 'result of search:' + JSON.stringify(existingRamparts));

}
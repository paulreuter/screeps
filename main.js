var creepController = require('creep.controller');
var roomController = require('room.controller');
var layoutRoom = require('layout.room');
module.exports.loop = function () {
/*
    var tower = Game.getObjectById('TOWER_ID');
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }
*/
    var spawn = Game.spawns['Spawn1'];
    // creepController.setDesiredForRole(spawn.room, 'miner', 1);
    // creepController.setDesiredForRole(spawn.room, 'upgrader',1);
    creepController.run(spawn);
    roomController.run(spawn.room);
}
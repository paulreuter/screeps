var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var desiredHarvesters = 2;
var desiredBuilders = 1;
var desiredUpgraders = 1;

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
    var totalCreeps = Object.keys(Game.creeps).length;
    if( totalCreeps < desiredHarvesters + desiredBuilders + desiredUpgraders + desiredHousekeepers)
    {
      for(var name in Memory.creeps) {
          if(!Game.creeps[name]) {
              delete Memory.creeps[name];
              console.log('Clearing non-existing creep memory:', name);
          }
      }
    
      var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
      var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
      var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
      var housekeepers = _.filter(Game.creeps, (creep) => creep.memory.role == 'housekeeper');

      if(housekeepers.length < desiredHousekeepers) {
          var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
          console.log('Spawning new harvester: ' + newName);
      }

      if(miners.length < desiredMiners) {
          var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'miner'});
          console.log('Spawning new miner: ' + newName);
      }
      if(builders.length < desiredBuilders) {
          var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'builder'});
          console.log('Spawning new harvester: ' + newName);
      }
      if(upgraders.length < desiredUpgraders) {
          var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
          console.log('Spawning new harvester: ' + newName);
      }
    }
    if(Game.spawns['Spawn1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }
    
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'housekeeper') {
            roleHousekeeper.run(creep);
        }
        if(creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }
}

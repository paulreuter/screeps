/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creep.base');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    collectEnergy: function(creep) {
        var targets = creep.room.find(FIND_STRUCTURES, {filter: (structure)=>{return structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] >= 150}});
        // console.log(JSON.stringify(targets.length));
        if( targets.length)
        {
            targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
            if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        } else {
            var droppedStuff = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
            if(droppedStuff != null){
                if(creep.pickup(droppedStuff) == ERR_NOT_IN_RANGE){
                    creep.moveTo(droppedStuff.pos)
                }
            } else {
                var sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
        }
    },
    deliverEnergy: function(creep) {
        var targets = creep.room.find(FIND_STRUCTURES, {filter: (structure)=>{return structure.structureType == STRUCTURE_CONTAINER && structure.store.energy < structure.store.energyCapacity}});
        if (targets.length < 1)
        {
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER ) && (structure.energy < structure.energyCapacity);
                    }
                });
        }
        if(targets.length > 0) {
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};
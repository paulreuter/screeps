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
            if( targets > 0)
            {
                targets = _.sortBy(targets, s => creep.pos.getRangeTo(s));
                if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else {
                var energy = creep.pos.findClosestByRange(FIND_DROPPED_ENERGY);
                if(energy != null){
                    if(creep.pickup(energy) == ERR_NOT_IN_RANGE){
                        creep.moveTo(energy.pos)
                    }
                } else {
                    var sources = creep.room.find(FIND_SOURCES);
                    if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                }
            }
    }
};

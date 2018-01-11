var base = require('creep.base');
var roleHousekeeper = {

    /** @param {Creep} creep **/
    run: function(creep) {
        base.toggleMode(creep)
        if( creep.memory.collecting )
        {
            base.collectEnergy(creep, ['COLLECT_GROUND', 'COLLECT_BASE', 'COLLECT_MINING']);
        } else {
            var targets = creep.room.find(FIND_STRUCTURES, 
                {
                filter: (structure) => {
                    return (typeof(structure) != "undefined") && (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN) && (structure.energy < structure.energyCapacity);}});
            if( !targets)
            {
                targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                        return (structure.hits < structure.hitsMax)
                    }
                });
                if( targets.length > 0)
                {
                    var i = creep.pos.findClosestByPath(targets);
                    if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
            }
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};

module.exports = roleHousekeeper;

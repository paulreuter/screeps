var base = require('creep.base');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        base.toggleMode(creep);
        if(creep.memory.collecting) 
        {
            
            base.collectEnergy(creep,['COLLECT_NEAREST_CONTAINER', 'COLLECT_SOURCE']);
        }
        else {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};

module.exports = roleUpgrader;
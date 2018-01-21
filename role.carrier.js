var base = require('creep.base');
var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        base.toggleMode(creep);
        if( creep.memory.collecting)
        {
            if( creep.room.energyAvailable < creep.room.energyCapacityAvailable)
            {
                base.collectEnergy( creep, ['COLLECT_BASE', 'COLLECT_MINING', 'COLLECT_NEAREST_CONTAINER']);
            }
            base.collectEnergy(creep, ['COLLECT_GROUND','COLLECT_MINING']);
            return true;
        } else 
        {
            if( creep.memory.renewing || creep.ticksToLive < 500)
            {
                creep.memory.renewing = true;
                if( !base.renew(creep) )
                {
                    creep.memory.renewing = false;
                } else {
                    return true;
                }
            }
            if( base.deliverEnergy(creep, ['DESTINATION_SPAWN', 'DESTINATION_TOWER', 'DESTINATION_ANY_CONTAINER', 'DESTINATION_BASE']))
                return true;
            base.toggleMode(creep, true);
        }
    }
};

module.exports = roleCarrier;

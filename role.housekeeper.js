var base = require('creep.base');
var roleHousekeeper = {

    /** @param {Creep} creep **/
    run: function(creep) {
        base.toggleMode(creep)
        if( creep.memory.collecting )
        {
            base.collectEnergy(creep, ['COLLECT_GROUND', 'COLLECT_BASE', 'COLLECT_MINING', 'COLLECT_SOURCE']);
            return;
        } else {
            
            if( base.deliverEnergy(creep, ['DESTINATION_SPAWN']))
            {
                base.renew(creep);
                return;
            }
            if( base.repair(creep))
            {
                return;              
            }
            var builder = require('role.builder');
            if( builder.build(creep))
            {
                return;
            }
        }
    }
};

module.exports = roleHousekeeper;

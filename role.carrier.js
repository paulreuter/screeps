var base = require('creep.base');
var roleCarrier = {

    /** @param {Creep} creep **/
    run: function(creep) {
        base.toggleMode(creep);
        if( creep.memory.collecting)
        {
            base.collectEnergy(creep, ['COLLECT_MINING']);
            return true;
        } else 
        {
            base.deliverEnergy(creep, ['DESTINATION_BASE', 'DESTINATION_ANY_CONTAINER']);
        }
    }
};

module.exports = roleCarrier;

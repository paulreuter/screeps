var base = require('creep.base');
var roleBuilder = {
    work: function(creep) {
        if( creep.memory.target)
        {
            var target = Game.getObjectById(creep.memory.target);
            if( target)
            {
                if(creep.build(target) == ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                creep.memory.target = null;
            }
        } 
        if( ! creep.memory.target)
        {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            // console.log(creep.name + ' has these targets: '+ JSON.stringify(targets));
            if(targets.length > 0 ) {
                targets.sort((a,b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));
                creep.memory.target = targets[0].id;
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                // should add repair
                base.deliverEnergy(creep, ['DESTINATION_SPAWN', 'DESTINATION_BASE']);
            }
        }
    },
    /** @param {Creep} creep **/
    run: function(creep) {
        base.toggleMode(creep);
        if(creep.memory.collecting) {
            base.collectEnergy(creep, ['COLLECT_GROUND', 'COLLECT_BASE', 'COLLECT_MINING']);
        } else 
        {
            roleBuilder.work(creep);
        }
    }
};

module.exports = roleBuilder;

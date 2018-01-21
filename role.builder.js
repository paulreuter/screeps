var base = require('creep.base');
var roleBuilder = {
    build: function(creep) {
        if( creep.memory.target['BUILD'])
        {
            var target = Game.getObjectById(creep.memory.target);
            if( target)
            {
                if(creep.build(target) == ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                return true;
            } else {
                delete creep.memory.target['BUILD'];
            }
        } 
        if( ! creep.memory.target['BUILD'])
        {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length > 0 ) {
                targets.sort((a,b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));
                creep.memory.target['BUILD'] = targets[0].id;
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
                return true;
            }
            return false;
        }
    },
    /** @param {Creep} creep **/
    run: function(creep) {
        base.toggleMode(creep);
        if(creep.memory.collecting) {
            // console.log( 'builder '+ creep.name + ' is collecting');
            base.collectEnergy(creep, ['COLLECT_GROUND', 'COLLECT_BASE', 'COLLECT_MINING', 'COLLECT_SOURCE']);
        } else 
        {
            // console.log( 'builder '+ creep.name + ' is working');
            if( roleBuilder.build(creep))
                return;
            if( base.repair(creep))
                return;
            // if( require('room.repair').increaseFortificationStrength(creep))
            //     return;
        }
    }
};

module.exports = roleBuilder;

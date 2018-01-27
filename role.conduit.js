/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.conduit');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
run: function(creep) {
    if( creep.spawning)
    {
        return;
    }
    if( ! creep.memory.comfy)
    {
        var pos = creep.memory.pos;
        if( ! pos)
        {
            for( var i in creep.room.memory.conduits)
            {
                var claimed = creep.room.memory.conduits[i].creep;
                if(claimed)
                {
                    var claimingCreep = Game.getObjectById(claimed);
                    if(claimingCreep)
                        continue;
                }
                creep.memory.pos = creep.room.memory.conduits[i].pos;
                creep.memory.from = creep.room.memory.conduits[i].from;
                creep.memory.to = creep.room.memory.conduits[i].to;
                creep.room.memory.conduits[i].creep = creep.id;
                break;
            }
        }
        if( pos )
        {
            if( !creep.pos.inRangeTo(pos, 0) )
            {
                creep.moveTo(pos.x, pos.y, {visualizePathStyle: {stroke: '#ffaa00'}});
                return;
            } else 
            {
                creep.memory.comfy = true;
            }
        }
    } else 
    {
        if( creep.carry[RESOURCE_ENERGY] < creep.carryCapacity)
        {
            var from = Game.getObjectById( creep.memory.from );
            if( from )
            {
                creep.withdraw(from, RESOURCE_ENERGY);
            }
        } else
        {
            var to = Game.getObjectById( creep.memory.to );
            if( to )
            {
                creep.transfer(to, RESOURCE_ENERGY);
            }
        }
    }
}
}

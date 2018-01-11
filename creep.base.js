
module.exports = {}
module.exports.collections = {};
module.exports.destinations = {};

function getEnergyFromTarget(creep, target)
{
     if( target instanceof Resource)
    {
        if(creep.pickup(target) == ERR_NOT_IN_RANGE)
        {
            creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
            return true;
        } 
    } else if ( target instanceof Structure)
    {
        if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            return true;
        }
    }
    else if( target instanceof Source)
    {
        if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
            return true;
        }
    }
    return false;
}

module.exports.toggleMode = function(creep)
    {
        if(!creep.memory.collecting && creep.carry.energy == 0) {
            creep.memory.collecting = true;
            creep.say('⚡');
        }
        if(creep.memory.collecting && creep.carry.energy == creep.carryCapacity) {
            creep.memory.collecting = false;
            creep.say('🚧');
        }
        delete(creep.memory.target);
    };
    
module.exports.collectEnergy = function(creep, target_types) {
        if( creep.memory.target)
        {
            console.log('Using target');
            var target = Game.getObjectById(creep.memory.target);
            
            if( target)
            {
                return getEnergyFromTarget(creep,target);
            }
            delete(creep.memory.target);
        } 
        if( ! creep.memory.target)
        {
            var target;
            for( var i in target_types)
            {
                target = module.exports.collections[target_types[i]](creep);
                if( target)
                {
                    break;
                }
            }
            if( target)
            {
                creep.memory.target = target.id;
                return getEnergyFromTarget(creep, target);
            } 
        }
        return false;
    };
    
module.exports.deliverEnergy = function(creep, target_types) 
    {
        if( creep.memory.target)
        {
            var target = Game.getObjectById(creep.memory.target);
            console.log('Delivering to target: '+ JSON.stringify(target));
            if( target)
            {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    return;
                }
            }
            delete(creep.memory.target);
        } 
        if( ! creep.memory.target)
        {
            var target;
            for( var i in target_types)
            {
                target = module.exports.destinations[target_types[i]](creep);
                if( target)
                {
                    break;
                }
            }
            if( target)
            {
                creep.memory.target = target.id;
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
        return false;
    };




module.exports.collections = {
    COLLECT_GROUND: function(creep)
    {
        var target;
        var droppedStuff = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (s)=>{return s.resourceType == RESOURCE_ENERGY}});
        if(droppedStuff.length)
        {
            droppedStuff = _.sortBy(droppedStuff, s => creep.pos.getRangeTo(s));
            for( var i in droppedStuff)
            {
                if(droppedStuff[i].amount > creep.carryCapacity )
                {
                    target = droppedStuff[i];
                    break;
                }
            }
            if( ! target)
            {
                target = droppedStuff[0];   
            }
        }
        return target;
    },
    COLLECT_MINING: function(creep)
    {
        var target;
        var flags = creep.room.find(FIND_FLAGS);
        targets = [];
        for( var i in flags)
        {
            if( flags[i].name.startsWith('Source'))
            {
                var look = flags[i].pos.look();
                if( look.length)
                {
                    for( var j in look)
                    {
                        if( look[j].type == LOOK_STRUCTURES)
                        {
                            if(look[j][LOOK_STRUCTURES].structureType == STRUCTURE_CONTAINER)
                            {
                                var structure = look[j][LOOK_STRUCTURES];
                                if( structure.store[RESOURCE_ENERGY] >= creep.carryCapacity)
                                {
                                    targets.push(structure);
                                }
                            }
                        }
                    }
                }
            }
        }

        if( targets.length)
        {
            targets = _.sortBy(targets, (s) => s.store[RESOURCE_ENERGY]);
            return targets[targets.length-1]; 
        }
        return null;
    },
    COLLECT_BASE: function(creep)
    {
        var target;
        var flags = creep.room.find(FIND_FLAGS);
        for( var i in flags)
        {
            if( flags[i].name.startsWith('Base'))
            {
                var look = flags[i].pos.look();
                if( look.length)
                {
                    for( var j in look)
                    {
                        if( look[j].type == LOOK_STRUCTURES)
                        {
                            if(look[j][LOOK_STRUCTURES].structureType == STRUCTURE_CONTAINER)
                            {
                                var structure = look[j][LOOK_STRUCTURES];
                                if( structure.store[RESOURCE_ENERGY] >= creep.carryCapacity)
                                {
                                    return structure;
                                }
                            }
                        }
                    }
                }
            }
        }
        return null;
    },
    COLLECT_SOURCE: function(creep)
    {
       creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE); 
    }
};

module.exports.destinations = {
    DESTINATION_SPAWN: function(creep)
    {
        targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER ) && (structure.energy < structure.energyCapacity);
            }
        });
        if( targets.length)
        {
            targets = _.sortBy(targets, (s) => creep.pos.getRangeTo(s));
            return targets[0]; 
        }
        return null;
    },
    DESTINATION_BASE: function(creep)
    {
        var target;
        var flags = creep.room.find(FIND_FLAGS);
        for( var i in flags)
        {
            if( flags[i].name.startsWith('Base'))
            {
                var look = flags[i].pos.look();
                if( look.length)
                {
                    for( var j in look)
                    {
                        if( look[j].type == LOOK_STRUCTURES)
                        {
                            if(look[j][LOOK_STRUCTURES].structureType == STRUCTURE_CONTAINER || look[j][LOOK_STRUCTURES.structureType == STRUCTURE_STORAGE])
                            {
                                var structure = look[j][LOOK_STRUCTURES];
                                if( structure.store[RESOURCE_ENERGY] < structure.storeCapacity)
                                {
                                    return structure;
                                }
                            }
                        }
                    }
                }
            }
        }
        return null;
    }
};
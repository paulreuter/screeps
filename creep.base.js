
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
        } 
        return true;
    } else if ( target instanceof Structure)
    {
        if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
        return true;
    }
    else if( target instanceof Source)
    {
        if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
        return true;
    }
    return false;
}


module.exports.repair = function(creep)
    {
        
        if( creep.memory.target['REPAIR'])
        {
            var target = Game.getObjectById(creep.memory.target['REPAIR']);
            if( target && target.hits < target.hitsMax)
            {
                if(creep.repair(target) == ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});  
                }
                return true;
            }
            delete creep.memory.target['REPAIR'];
        } 
        if( ! creep.memory.target['REPAIR'])
        {
            let repair = require('room.repair');
            var repList = repair.getCivilianRepairList(creep.room);
            if( repList.length)
            {

                var targetID = repList.shift();
                var target = Game.getObjectById(targetID);
                if( target)
                {
                    creep.memory.target['REPAIR'] = targetID;
                    
                    if(creep.repair(target) == ERR_NOT_IN_RANGE) 
                    {
                        creep.moveTo(target);  
                    }
                    return true;
                }
            } 
        }
        return false;
    }
    
module.exports.renew = function(creep)
    {
        if( creep.memory.obsolete)
            return false;
        if( creep.room.energyAvailable + creep.carry[RESOURCE_ENERGY] < creep.room.energyCapacityAvailable)
            return false;
        var myCost = creep.body.reduce(function (cost, part) {
            return cost + BODYPART_COST[part.type];
            }, 0);
        var renewEnergyCost = Math.ceil(myCost/2.5/creep.body.length);

        if( Math.min(renewEnergyCost, creep.carryCapacity) <= creep.carry[RESOURCE_ENERGY])
        {
            var spawn = creep.pos.findClosestByRange(FIND_MY_SPAWNS);
            if( spawn)
            {
                if( !spawn.spawning)
                {
                    var extendTime = Math.floor(600/creep.body.length);
                    if( (1500 - creep.ticksToLive) >= extendTime)
                    {
                        
                        if( renewEnergyCost < spawn.energy)
                        {
                            var status = spawn.renewCreep(creep);
                            if( status == OK)
                            {
                                creep.transfer(spawn, RESOURCE_ENERGY);
                                return true;
                            } else if ( status = ERR_NOT_IN_RANGE)
                            {
                                creep.moveTo(spawn, {visualizePathStyle: {stroke: '#ffffff'}});
                                return true;
                            } else {
                                console.log( 'Tried renewing, status is: '+status);
                            }
                        }
                    }
                    
                }
            }
        }
        return false;
    }
module.exports.toggleMode = function(creep, force)
    {
        if(!creep.memory.collecting && (creep.carry.energy == 0 || force)) {
            creep.memory.collecting = true;
            creep.say('⚡');
            creep.memory.target = {};
        }
        if(creep.memory.collecting && (creep.carry.energy == creep.carryCapacity || force)) {
            creep.memory.collecting = false;
            creep.say('🚧');
            creep.memory.target = {};
        }
    };
    
module.exports.collectEnergy = function(creep, target_types) {
        if( creep.memory.target['COLLECT'])
        {
            var target = Game.getObjectById(creep.memory.target);
            
            if( target)
            {
                return getEnergyFromTarget(creep,target);
            }
            delete creep.memory.target['COLLECT'];
        } 
        if( ! creep.memory.target['COLLECT'])
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
                creep.memory.target['COLLECT'] = target.id;
                return getEnergyFromTarget(creep, target);
            } 
        }
        return false;
    };
    
module.exports.deliverEnergy = function(creep, target_types) 
    {
        if( creep.memory.target['DELIVER'])
        {
            var target = Game.getObjectById(creep.memory.target);
            // console.log('Delivering to target: '+ JSON.stringify(target));
            if( target)
            {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                return true;
            }
            delete creep.memory.target['DELIVER'];
        } 
        if( ! creep.memory.target['DELIVER'])
        {
            var target;
            for( var i in target_types)
            {
                target = module.exports.destinations[target_types[i]](creep);
                if( target)
                {
                    // console.log( 'Got target: ' + JSON.stringify( target) + ' from '+ target_types[i]);
                    break;
                }
            }
            if( target)
            {
                creep.memory.target['DELIVER'] = target.id;
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                return true;
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
        }
        return target;
    },
    COLLECT_MINING: function(creep)
    {
        var target;
        var flags = creep.room.find(FIND_FLAGS);
        var targets = [];
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
        if( creep.room.storage)
        {
            if( creep.room.storage.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry[RESOURCE_ENERGY])
            {
                return creep.room.storage;
            }
        }
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
       return creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE); 
    },
    COLLECT_NEAREST_CONTAINER: function(creep)
    {
        var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return ((structure.structureType == STRUCTURE_CONTAINER ) && (structure.store[RESOURCE_ENERGY] >= creep.carryCapacity))
            || ((structure.structureType == STRUCTURE_LINK ) && (structure.energy >= creep.carryCapacity))
            || ((structure.structureType == STRUCTURE_STORAGE ) && (structure.store[RESOURCE_ENERGY] >= creep.carryCapacity));
            }
        });
        if( targets.length)
        {
            targets = _.sortBy(targets, (s) => creep.pos.getRangeTo(s));
            return targets[0]; 
        }
        return null;
    }
};

module.exports.destinations = {
    DESTINATION_SPAWN: function(creep)
    {
        var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN
                // || structure.structureType == STRUCTURE_TOWER 
                ) && (structure.energy < structure.energyCapacity);
            }
        });
        if( targets.length)
        {
            targets = _.sortBy(targets, (s) => creep.pos.getRangeTo(s));
            return targets[0]; 
        }
        return null;
    },
    DESTINATION_TOWER: function(creep)
    {
        var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return ( structure.structureType == STRUCTURE_TOWER 
                ) && (structure.energy < structure.energyCapacity);
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
                                    target = structure;
                                    break;
                                }
                            }
                        }
                    }
                break;
                }
            }
        }
        if( target)
        {
            return target;
        } else if( creep.room.storage)
        {
            return creep.room.storage;
        }
        return null;
    },
    
    DESTINATION_ANY_CONTAINER: function(creep)
    {
        var allStructures = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER ) && (structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
            }
        });
        allStructures = allStructures.filter( (s) => {
            var flag = s.pos.lookFor(LOOK_FLAGS);
            return(flag && flag.length && !flag[0].name.startsWith('Source'));
        });
        var targets = allStructures.filter((s) => { return s.store[RESOURCE_ENERGY] < (0.25* s.storeCapacity)} );
        if( ! targets.length)
            targets = allStructures.filter((s) => { return s.store[RESOURCE_ENERGY] < (0.5* s.storeCapacity)} );
        if( ! targets.length)
            targets = allStructures.filter((s) => { return s.store[RESOURCE_ENERGY] < (0.75* s.storeCapacity)} );
        if( ! targets.length)
            targets = allStructures.filter((s) => { return (s.store[RESOURCE_ENERGY] + creep.carry[RESOURCE_ENERGY]) < s.storeCapacity});
        if( targets.length)
        {
            targets = _.sortBy(targets, (s) => creep.pos.getRangeTo(s));
            return targets[0]; 
        }
        return null;

    }
};


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

module.exports.repairList = {};

module.exports.resetRepairList =function(room)
    {
        delete module.exports.repairList[room.name];
    }

module.exports.getCivilianRepairList = function(room)
    {
        if( !(module.exports.repairList && module.exports.repairList[room.name]))
        {
            console.log('Calculating repair list for tick '+ Game.time);
            var nonHealthyOwned = room.find(FIND_MY_STRUCTURES, {filter: 
                (s)=> { 
                    return s.hits < s.hitsMax;}});
            var nonHealthyCivilians = room.find(FIND_STRUCTURES, {filter: 
                (s)=> { 
                    // console.log( 'Filtering: '+ JSON.stringify(s));
                    if( s.structureType == STRUCTURE_RAMPART)
                    {
                        if( s.hits < RAMPART_DECAY_AMOUNT * 10)
                        {
                            // console.log( 'true (' + s.hits + '/'+RAMPART_DECAY_AMOUNT);
                            return true;
                        } 
                        // console.log( 'false');
                        return false;
                    }
                    // console.log( s.structureType == STRUCTURE_WALL ? s.hits < room.memory.wallhp : s.hits < s.hitsMax);
                    return (s.structureType == STRUCTURE_WALL ? s.hits < room.memory.wallhp : s.hits < s.hitsMax);}});
            var allNonHealthy = nonHealthyCivilians.concat(nonHealthyOwned);
            allNonHealthy = _.sortBy(allNonHealthy, (s)=> {
                return (s.hits / s.hitsMax);
                } );
            if( ! module.exports.repairList)
            {
                console.log( 'repairlist was cleared');
                module.exports.repairList = {};
            }
            module.exports.repairList[room.name] = allNonHealthy;
        } 
        return module.exports.repairList[room.name];
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
                    creep.moveTo(target);  
                }
                return true;
            }
            delete creep.memory.target['REPAIR'];
        } 
        if( ! creep.memory.target['REPAIR'])
        {
            var repList = module.exports.getCivilianRepairList(creep.room);
            if( repList.length)
            {

                var target = repList.shift();
                creep.memory.target['REPAIR'] = target.id;
                if(creep.repair(target) == ERR_NOT_IN_RANGE) 
                {
                    creep.moveTo(target);  
                }
                return true;
            } 
        }
        return false;
    }
    
module.exports.tryRenew = function(creep)
    {
        if( creep.memory.obsolete)
            return;
        var spawns = creep.pos.findInRange(FIND_MY_SPAWNS, 1);
        if( spawns.length)
        {
            var spawn = spawns[0];
            if( !spawn.spawning)
            {
                var extendTime = Math.floor(600/creep.body.length);
                if( (1500 - creep.ticksToLive) >= extendTime)
                {
                    var myCost = creep.body.reduce(function (cost, part) {
                                return cost + BODYPART_COST[part.type];
                            }, 0);
                    var renewEnergyCost = Math.ceil(myCost/2.5/creep.body.length);
                    if( renewEnergyCost < spawn.energy)
                    {
                        console.log('Renewed creep '+ creep.name);
                        spawn.renewCreep(creep);
                    }
                }
                
            }
        }
    }
module.exports.toggleMode = function(creep)
    {
        if(!creep.memory.collecting && creep.carry.energy == 0) {
            creep.memory.collecting = true;
            creep.say('⚡');
            creep.memory.target = {};
        }
        if(creep.memory.collecting && creep.carry.energy == creep.carryCapacity) {
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
            return (structure.structureType == STRUCTURE_CONTAINER ) && (structure.store[RESOURCE_ENERGY] >= creep.carryCapacity);
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
            return(flag && !flag[0].name.startsWith('Source'));
        });
        var targets = allStructures.filter((s) => { s.store[RESOURCE_ENERGY] < 0.25* s.storeCapacity} );
        if( ! targets.length)
            targets = allStructures.filter((s) => { s.store[RESOURCE_ENERGY] < 0.5* s.storeCapacity} );
        if( ! targets.length)
            targets = allStructures.filter((s) => { s.store[RESOURCE_ENERGY] < 0.75* s.storeCapacity} );
        if( ! targets.length)
            targets = allStructures;
        if( targets.length)
        {
            targets = _.sortBy(targets, (s) => creep.pos.getRangeTo(s));
            return targets[0]; 
        }
        return null;

    }
};
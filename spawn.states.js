/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawn.states');
 * mod.thing == 'a thing'; // true
 */

module.exports = {};



module.exports.CONDITION_SOURCE_HAS_CONTAINER_BUILT = function(spawn)
{
    var containers = spawn.room.find(FIND_STRUCTURES, 
        { filter: (i) => i.structureType == STRUCTURE_CONTAINER} );
    if( containers.length > 0)
    {
        return true;
    }
    return false;
};

module.exports.CONDITION_ALL_SOURCES_HAVE_CONTAINERS = function(spawn)
{
    var containers = spawn.room.find(FIND_STRUCTURES, 
        { filter: (i) => i.structureType == STRUCTURE_CONTAINER} );
    var sources = spawn.room.find(FIND_SOURCES);
    if( containers.length >= sources.length || containers.length > 2)
    {
        return true;
    }
    return false;
};

module.exports.CONDITION_RCL_LEVEL_TWO = function(spawn)
{
    return (spawn.room.controller.level > 1 );
};

module.exports.CONDITION_FIVE_EXTENSIONS_BUILT = function(spawn)
{
    var extensions = spawn.room.find(FIND_STRUCTURES, 
        { filter: (i) => i.structureType == STRUCTURE_EXTENSION} );
    return  (extensions.length > 4)
};

module.exports.INITIALIZE = function(spawn)
{
    var source = spawn.pos.findClosestByPath(FIND_SOURCES);
    var waypoints = spawn.room.findPath(
                    source.pos,
                    spawn.pos,
                    {'ignoreCreeps': true} );
    
    spawn.room.createFlag(waypoints[0].x, waypoints[0].y, "Source1");
    spawn.room.createConstructionSite(
                            waypoints[0].x, waypoints[0].y,
                            STRUCTURE_CONTAINER );
    
    spawn.memory.desired_miners = 1;                        
    spawn.memory.miner_configuration = [WORK,WORK,MOVE];
    
    spawn.memory.desired_builders = 1;
    spawn.memory.builder_configuration = [WORK, CARRY, MOVE];

    spawn.memory.desired_carriers = 0;
    spawn.memory.carrier_configuration = [ CARRY, CARRY, MOVE];
    
    spawn.memory.desired_upgraders = 0;
    spawn.memory.upgrader_configuration = [WORK,CARRY,MOVE];
};

module.exports.ACTION_ALL_MINING = function(spawn)
{
    spawn.memory.desired_carriers = 1;
    var sources = spawn.room.find(FIND_SOURCES);
    if( sources.length > 1)
    {
        var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
        for(var i in sources) {
            var id = sources[i].id;
            var claimed = false;
            for( var j in miners)
            {
                var minername = miners[j].name;
//                    console.log('Trying to look at ' + miners[j].name);
                if( miners[j] != creep && miners[j] != null)
                {
//                        console.log('Inspecting target of '+ minername);
                    if( miners[j].memory.mySource == id)
                    {
//                            console.log(minername + 'already works on '+id);
                        claimed = true;
                        break;
                    }
                }
            }
            if( claimed)
            {
                continue;
            }
            var waypoints = spawn.room.findPath(
                    sources[i].pos,
                    spawn.pos,
                    {'ignoreCreeps': true} );
    
            spawn.room.createFlag(waypoints[0].x, waypoints[0].y, "Source"+i);
            spawn.room.createConstructionSite(
                            waypoints[0].x, waypoints[0].y,
                            STRUCTURE_CONTAINER );

            
        }
        spawn.memory.desired_miners = sources.length;
    }
    
};

module.exports.ACTION_MINING_DONE = function(spawn)
{
    
    var containers = spawn.room.find(FIND_STRUCTURES, {filter: (structure)=>{return structure.structureType == STRUCTURE_CONTAINER}});
    var waypoints = spawn.room.findPath(
        containers[0].pos,
        spawn.room.getPositionAt(spawn.pos.x + 6, spawn.pos.y),
        {'ignoreCreeps': true} );
    waypoints.forEach(
        function(waypoint){
            spawn.room.createConstructionSite(
                waypoint.x,
                waypoint.y,
                STRUCTURE_ROAD );
        });
    spawn.memory.desired_upgraders = 1;
    spawn.memory.desired_builders = 2;
};

module.exports.ACTION_BUILD_EXTENSIONS = function(spawn)
{
    spawn.room.createConstructionSite( spawn.pos.x + 4, spawn.pos.y + 2, STRUCTURE_EXTENSION);
    spawn.room.createConstructionSite( spawn.pos.x + 3, spawn.pos.y + 2, STRUCTURE_EXTENSION);
    spawn.room.createConstructionSite( spawn.pos.x + 2, spawn.pos.y + 2, STRUCTURE_EXTENSION);
    spawn.room.createConstructionSite( spawn.pos.x + 4, spawn.pos.y - 2, STRUCTURE_EXTENSION);
    spawn.room.createConstructionSite( spawn.pos.x + 3, spawn.pos.y - 2, STRUCTURE_EXTENSION);
    spawn.room.createConstructionSite( spawn.pos.x + 1, spawn.pos.y, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 2, spawn.pos.y, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 3, spawn.pos.y, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 4, spawn.pos.y, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 5, spawn.pos.y, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 1, spawn.pos.y + 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 2, spawn.pos.y + 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 3, spawn.pos.y + 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 4, spawn.pos.y + 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 5, spawn.pos.y + 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 6, spawn.pos.y + 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 1, spawn.pos.y - 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 2, spawn.pos.y - 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 3, spawn.pos.y - 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 4, spawn.pos.y - 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 5, spawn.pos.y - 1, STRUCTURE_ROAD);
    spawn.room.createConstructionSite( spawn.pos.x + 6, spawn.pos.y - 1, STRUCTURE_ROAD);
};

module.exports.ACTION_BUILD_CONTROLLER_SUPPORT = function(spawn)
{
    spawn.memory.desired_carriers = 2;
    spawn.room.createConstructionSite( spawn.pos.x + 6, spawn.pos.y, STRUCTURE_CONTAINER);
    
    
    var waypoints = spawn.room.findPath(
        creep.room.controller.pos,
        spawn.room.getPositionAt(spawn.pos.x + 6, spawn.pos.y),
        {'ignoreCreeps': true} );
    waypoints.splice(0,2);
    
    waypoints.forEach(
        function(waypoint){
            spawn.room.createConstructionSite(
                waypoint.x,
                waypoint.y,
                STRUCTURE_ROAD );
        });
    spawn.room.createConstructionSite( spawn.pos.x + 6, spawn.pos.y, STRUCTURE_CONTAINER);
    
};

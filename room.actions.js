/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room.actions');
 * mod.thing == 'a thing'; // true
 */
var helper = require('helper');

module.exports = {};

module.exports.INITIALIZE = function(room)
{
    console.log('Action INITIALIZE ('+room.name+')');
    var spawns = room.find(FIND_MY_SPAWNS);
    if( spawns.length )
    {
        var sources = room.find(FIND_SOURCES);
        var spawnController = require('creep.controller');
        
        spawnController.setDesiredForRole(room, 'miner', sources.length);
        spawnController.setDesiredForRole(room, 'builder', sources.length);     
        spawnController.setDesiredForRole(room, 'upgrader', 0);
        spawnController.setDesiredForRole(room, 'carrier', 0);
        spawnController.setDesiredForRole(room, 'housekeeper', 2);

        room.memory.miner_configuration = [WORK,WORK,MOVE, MOVE];
        room.memory.builder_configuration = [WORK, WORK, CARRY, MOVE];
        room.memory.carrier_configuration = [ CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
        room.memory.upgrader_configuration = [WORK,CARRY,CARRY,MOVE,MOVE];
        room.memory.housekeeper_configuration = [WORK, CARRY,CARRY, MOVE,MOVE];
        
        var spawn = spawns[0];
        
        var source = spawn.pos.findClosestByPath(FIND_SOURCES);
        if( source.pos.x >= spawn.pos.x)
        {
            if( source.pos.y <= spawn.pos.y)
            {
                room.memory.base_direction = TOP_RIGHT;
            } else 
            {
                room.memory.base_direction = BOTTOM_RIGHT;
            }
        } else 
        {
            if( source.pos.y <= spawn.pos.y)
            {
                room.memory.base_direction = TOP_LEFT;
            } else 
            {
                room.memory.base_direction = BOTTOM_LEFT;
            }
        }
        var baseX = waypoints[0].x + waypoints[0].dx;
        var baseY = waypoints[0].y + waypoints[0].dy;
            
        
        room.createFlag(baseX, baseY, "Base1");
    }
};

module.exports.PREPARE_SOURCES = function(room)
{
    console.log('Action: Prepare sources ('+room.name+')');
        var sources = room.find(FIND_SOURCES);
        var base = Game.flags['Base1'];
        sources.sort((a,b) => base.pos.getRangeTo(a) - base.pos.getRangeTo(b));
        var j = 1;
        for( var i in sources )
        {
            var waypoints = room.findPath(
                        base.pos,
                        sources[i].pos,
                        {ignoreCreeps: true} );
            room.createFlag(waypoints[waypoints.length-2].x, waypoints[waypoints.length-2].y, 'Source'+(j++));
        }

}

module.exports.MINING_CONTAINERS = function(room)
{
    console.log('Action: Mining containers ('+room.name+')');
    var flags = room.find(FIND_FLAGS, {filter: (flag)=> {return flag.name.startsWith('Source')}});
    if( flags.length > 0)
    {
        for(var i in flags) {
            console.log('Constructing new container at '+ flags[i].x +'/'+flags[i].y +' ('+flags[i].name+')');
            helper.buildOverRoad(room, 
                            flags[i].pos,
                            STRUCTURE_CONTAINER );
        }
    }
};

module.exports.BASE_CONTAINER = function(room)
{
    var flag = Game.flags['Base1'];
    helper.buildOverRoad(room, flag.pos, STRUCTURE_CONTAINER);
}

module.exports.CONNECT_ALL_SOURCES = function(room)
{
    var flags = room.find(FIND_FLAGS, {filter: (flag)=> {return flag.name.startsWith('Source')}});
    var base = Game.flags['Base1'];

    if( flags.length > 0)
    {
        for( var i in flags)
        {
            var waypoints = room.findPath(base.pos, flags[i].pos, {ignoreCreeps: true});
            waypoints.forEach(
                function(waypoint){
                    room.createConstructionSite(
                    waypoint.x,
                    waypoint.y,
                    STRUCTURE_ROAD );
                });

        }
    }
}

module.exports.START_UPGRADING = function(room)
{
    var spawnController = require('creep.controller');
    spawnController.setDesiredForRole(room, 'upgrader', 1);
}

module.exports.BUILD_CARRIERS = function(room)
{
    var spawnController = require('creep.controller');
    spawnController.setDesiredForRole(room, 'carrier', room.memory.desired_miners);
}

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

module.exports.BUILD_EXTENSIONS = function(room)
{
    var layouter = require('room.layouter');
    layouter.buildExtensions(room);
};

module.exports.BUILD_CONTROLLER_SUPPORT = function(room)
{
    var spawnController = require('creep.controller');
    spawnController.setDesiredForRole(room, carrier, 2);
    
    var base = Game.flags['Base'];
    
    var waypoints = spawn.room.findPath(
        room.controller.pos,
        base,
        {ignoreCreeps: true} );
    helper.buildOverRoad(room, waypoints[1], STRUCTURE_CONTAINER);
    waypoints.splice(0,2);
    waypoints.forEach(
        function(waypoint){
            spawn.room.createConstructionSite(
                waypoint.x,
                waypoint.y,
                STRUCTURE_ROAD)
        });
}
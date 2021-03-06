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

module.exports.RESET_STATE_MACHINE = function(room)
{
    delete(room.memory.state_machine );
}

module.exports.INITIALIZE = function(room)
{
    console.log('Action INITIALIZE ('+room.name+')');
    var spawns = room.find(FIND_MY_SPAWNS);
    if( spawns.length )
    {
        var sources = room.find(FIND_SOURCES);
        var spawnController = require('creep.controller');
        
        spawnController.setDesiredForRole(room, 'miner', sources.length * 2);
        spawnController.setDesiredForRole(room, 'builder', sources.length);     
        spawnController.setDesiredForRole(room, 'upgrader', 0);
        spawnController.setDesiredForRole(room, 'carrier', 0);
        spawnController.setDesiredForRole(room, 'housekeeper', 2);
        
        var creepConf = require('creep.configuration');
        creepConf.refreshConfigurations(room);
 
        let layout = require('room.layouter');
        layout.seedBase(room);
        
        let repair = require('room.repair');
        repair.increaseFortificationStrength(room);
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
            console.log('Constructing new container at '+ flags[i].pos.x +'/'+flags[i].pos.y +' ('+flags[i].name+')');
            helper.buildOverRoad(room, 
                            flags[i].pos.x, flags[i].pos.y,
                            STRUCTURE_CONTAINER );
        }
    }
};

module.exports.BASE_CONTAINER = function(room)
{
    var flag = Game.flags['Base1'];
    helper.buildOverRoad(room, flag.pos.x, flag.pos.y, STRUCTURE_CONTAINER);
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
    spawnController.setDesiredForRole(room, 'upgrader', 2);
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

module.exports.REFRESH_BLUEPRINTS = function(room)
{
    var creepConf = require('creep.configuration');
    creepConf.refreshConfigurations(room);
};

module.exports.BUILD_CONTROLLER_SUPPORT = function(room)
{
    var spawnController = require('creep.controller');
    // spawnController.setDesiredForRole(room, 'carrier', room.memory.desired_carriers + 1);
    
    var base = Game.flags['Base1'];
    
    var waypoints = room.findPath(
        room.controller.pos,
        base.pos,
        {ignoreCreeps: true} );
        
    helper.buildOverRoad(room, waypoints[1].x, waypoints[1].y, STRUCTURE_CONTAINER);
    room.createFlag( waypoints[1].x, waypoints[1].y, "Controller1");
    waypoints.splice(0,2);
    waypoints.forEach(
        function(waypoint){
            room.createConstructionSite(
                waypoint.x,
                waypoint.y,
                STRUCTURE_ROAD)
        });
}
function buildOneElementInDirection( room, direction, pathSource, structureType, cachedCostMatrix)
{

    var exit = pathSource.findClosestByPath(direction,{ 
        costCallback: function(roomName, costMatrix) {
            if( roomName === room.name)
                return cachedCostMatrix;
        },ignoreCreeps:true});
    console.log( 'Exit position found: '+ JSON.stringify(exit) );
    if( ! exit)
    {
        return false;
    }
    var pathFromExitToSpawn = exit.findPathTo(pathSource, {costCallback: function( roomName, costMatrix) {
        if( roomName === room.name)
            return cachedCostMatrix},ignoreCreeps: true});
    if( pathFromExitToSpawn.length)
    {
        for( var i in pathFromExitToSpawn)
        {
            var status = room.createConstructionSite( pathFromExitToSpawn[i].x, pathFromExitToSpawn[i].y, structureType);
            if( status == OK)
            {
                console.log( 'Built ' +structureType +' at '+ pathFromExitToSpawn[i].x + '/'+ pathFromExitToSpawn[i].y);
                cachedCostMatrix.set( pathFromExitToSpawn[i].x, pathFromExitToSpawn[i].y, 255);
                return true;
                break;
            } else if ( status == ERR_INVALID_TARGET)
            {
                console.log('Wall building invalid target:  ' +  pathFromExitToSpawn[i].x + '/'+ pathFromExitToSpawn[i].y);
                continue;
            } else if( status == ERR_INVALID_ARGS)
            {
                console.log('Wall building invalid args:  ' +  pathFromExitToSpawn[i].x + '/'+ pathFromExitToSpawn[i].y);
                continue;
            } else
            {
                return false;
            }
        }
    } else 
        return false;

}

module.exports.USE_ONE_MINER_PER_SOURCE = function(room)
{
    let sources = room.find(FIND_SOURCES);
    let cc = require('creep.controller');
    cc.setDesiredForRole(room, 'miner', sources.length);
}

module.exports.USE_STATIONARY_UPGRADER = function(room)
{
    room.memory['upgrader_index'] = 1;
}

module.exports.BUILD_TOWER = function(room)
{
    var flag = Game.flags['Base1'];
    room.createConstructionSite(flag.pos.x + 2, flag.pos.y, STRUCTURE_TOWER);
}

module.exports.BUILD_RAMPARTS = function( room)
{
    var flag = Game.flags['Base1'];
    room.createConstructionSite(flag.pos.x + 2, flag.pos.y, STRUCTURE_RAMPART);
}

module.exports.BUILD_NEXT_EXIT_RAMPART = function(room)
{
    let cachedCostMatrix = new PathFinder.CostMatrix;
    var structures = room.find(FIND_STRUCTURES);
    var wall_construction = room.find(FIND_MY_CONSTRUCTION_SITES, {filter:(s) => {
        return (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)}});
    wall_construction.forEach( wall => {
                       cachedCostMatrix.set(wall.pos.x, wall.pos.y, 255) });
    structures.forEach( wall => {
                       cachedCostMatrix.set(wall.pos.x, wall.pos.y, 255) });
                     
    var spawn = room.find(FIND_MY_SPAWNS)[0];
    var directions = [ FIND_EXIT_RIGHT, FIND_EXIT_TOP, FIND_EXIT_BOTTOM,FIND_EXIT_LEFT];
    for( var i in directions )
    {
        // console.log( 'Trying direction '+ directions[i]+ ' from '+ JSON.stringify(spawn.pos));
        var exit = spawn.pos.findClosestByPath(directions[i],{ 
        costCallback: function(roomName, costMatrix) {
            if( roomName === room.name)
                return cachedCostMatrix;
        }, ignoreCreeps:true});
        if( ! exit)
            continue;
        // console.log( 'Found exit '+JSON.stringify(exit));
        var existingRamparts = exit.findInRange( FIND_STRUCTURES, 4,{filter:(s) => { return s.structureType == STRUCTURE_RAMPART}});
        //console.log( 'Found: ' + JSON.stringify(existingRamparts));
        if( existingRamparts.length )
            continue;
        return buildOneElementInDirection( room, directions[i], spawn.pos, STRUCTURE_RAMPART, cachedCostMatrix);
    }
}

module.exports.BUILD_WALLS = function(room)
{
    let cachedCostMatrix = new PathFinder.CostMatrix;
    var structures = room.find(FIND_STRUCTURES);
    var wall_construction = room.find(FIND_MY_CONSTRUCTION_SITES, {filter:(s) => {
        return (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART)}});
    wall_construction.forEach( wall => {
                       cachedCostMatrix.set(wall.pos.x, wall.pos.y, 255) });
    structures.forEach( wall => {
                       cachedCostMatrix.set(wall.pos.x, wall.pos.y, 255) });
                     
    var spawn = room.find(FIND_MY_SPAWNS)[0];
    for( var i = 0; i < 50; i++)
    {
        buildOneElementInDirection( room, FIND_EXIT_TOP, spawn.pos, STRUCTURE_WALL, cachedCostMatrix);
        buildOneElementInDirection( room, FIND_EXIT_RIGHT, spawn.pos, STRUCTURE_WALL, cachedCostMatrix);
        buildOneElementInDirection( room, FIND_EXIT_BOTTOM, spawn.pos, STRUCTURE_WALL, cachedCostMatrix);
        buildOneElementInDirection( room, FIND_EXIT_LEFT, spawn.pos, STRUCTURE_WALL, cachedCostMatrix);
    }
}

module.exports.BUILD_STORAGE = function(room)
{
    var flag = Game.flags['Base1'];
    let coordinates = require('coordinates');
    let pos = coordinates.getRotatedCoordinates( flag.pos, 1,-1, room.memory.base_direction);
    room.createConstructionSite(pos, STRUCTURE_STORAGE );
    
}
/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room.conditions');
 * mod.thing == 'a thing'; // true
 */

module.exports = {};

module.exports.TRUE = function(room)
{
    return true;
}
module.exports.FALSE = function(room)
{
    return false;
}

module.exports.MOSTLY_FALSE = function( room)
{
    return Math.random() > 0.99;
}

module.exports.SPAWN_EXISTS = function(room)
{
    return (room.find(FIND_MY_SPAWNS).length > 0);
}

module.exports.ONE_CONTAINER_BUILT = function(room)
{
    var containers = room.find(FIND_STRUCTURES, 
        { filter: (i) => i.structureType == STRUCTURE_CONTAINER} );
    if( containers.length > 0)
    {
        return true;
    }
    return false;
};

module.exports.ALL_CONSTRUCTION_DONE = function(room)
{
    var targets = room.find(FIND_MY_CONSTRUCTION_SITES);
    return (targets.length == 0);
}

module.exports.ALL_SOURCES_HAVE_CONTAINERS = function(room)
{
    var containers = room.find(FIND_STRUCTURES, 
        { filter: (i) => i.structureType == STRUCTURE_CONTAINER} );
    var sources = room.find(FIND_SOURCES);
    if( containers.length >= sources.length || containers.length > 2)
    {
        return true;
    }
    return false;
};

module.exports.RCL_LEVEL_TWO = function(room)
{
    return (room.controller.level > 1 );
};

module.exports.RCL_LEVEL_THREE = function(room)
{
    return (room.controller.level > 2 );
};

module.exports.RCL_LEVEL_FOUR = function(room)
{
    return (room.controller.level > 3 );
};

module.exports.FIVE_EXTENSIONS_BUILT = function(room)
{
    var extensions = room.find(FIND_STRUCTURES, 
        { filter: (i) => i.structureType == STRUCTURE_EXTENSION} );
    return  (extensions.length > 4)
};

module.exports.ALL_RAMPARTS_HEALTHY = function(room)
{
    var brokenRamparts = room.find( FIND_STRUCTURES, { filter: (s)=> 
        {return (s.structureType === STRUCTURE_RAMPART && s.hits < RAMPART_DECAY_AMOUNT * 10 )}});
    return (! brokenRamparts.length);
};

module.exports.ALL_EXITS_HAVE_RAMPARTS = function( room)
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
        var exit = spawn.pos.findClosestByPath(directions[i],{ 
        costCallback: function(roomName, costMatrix) {
            if( roomName === room.name)
                return cachedCostMatrix;
        }, ignoreCreeps:true});
        if( ! exit )
            continue;
        var existingRamparts = exit.findInRange( FIND_STRUCTURES, 4,{filter:(s) => { return s.structureType == STRUCTURE_RAMPART}});
        if( existingRamparts.length )
            continue;
        return false;
    }
    return true;
    
};
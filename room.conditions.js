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

module.exports.ONE_CONTAINER_BUILT = function(myRoom)
{
    var containers = myRoom.find(FIND_STRUCTURES, 
        { filter: (i) => i.structureType == STRUCTURE_CONTAINER} );
    if( containers.length > 0)
    {
        return true;
    }
    return false;
};

module.exports.ALL_CONSTRUCTION_DONE = function(myRoom)
{
    var targets = myRoom.find(FIND_MY_CONSTRUCTION_SITES);
    return (targets.length == 0);
}

module.exports.ALL_SOURCES_HAVE_CONTAINERS = function(myRoom)
{
    var containers = myRoom.find(FIND_STRUCTURES, 
        { filter: (i) => i.structureType == STRUCTURE_CONTAINER} );
    var sources = myRoom.find(FIND_SOURCES);
    if( containers.length >= sources.length || containers.length > 2)
    {
        return true;
    }
    return false;
};

module.exports.RCL_LEVEL_TWO = function(myRoom)
{
    return (myRoom.controller.level > 1 );
};

module.exports.RCL_LEVEL_THREE = function(myRoom)
{
    return (myRoom.controller.level > 2 );
};

module.exports.FIVE_EXTENSIONS_BUILT = function(myRoom)
{
    var extensions = myRoom.find(FIND_STRUCTURES, 
        { filter: (i) => i.structureType == STRUCTURE_EXTENSION} );
    return  (extensions.length > 4)
};
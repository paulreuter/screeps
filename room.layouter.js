const coordinates = require('coordinates');
const helper = require('helper');

module.exports = {};

const extensionsForRCL = [ 0, 0, 5, 10, 20, 30, 40, 50, 60];
const extensionPattern = [ 
    {   x:  0,
        y:  0,
        type: STRUCTURE_ROAD },
    {   x:  0,
        y: -1,
        type: STRUCTURE_EXTENSION },
    {   x:  1,
        y:  0,
        type: STRUCTURE_EXTENSION },
    {   x:  1,
        y: -1,
        type: STRUCTURE_ROAD },
    {   x:  0,
        y: -2,
        type: STRUCTURE_EXTENSION },
    {   x:  2,
        y:  0,
        type: STRUCTURE_EXTENSION },
    {   x:  2,
        y: -2,
        type: STRUCTURE_EXTENSION },
    {   x:  1,
        y: -2,
        type: STRUCTURE_ROAD },
    {   x:  2,
        y: -1,
        type: STRUCTURE_ROAD },

    ];
    
const extensionClusters = [
        {
            x:1,
            y:-1,
            dir:TOP_RIGHT,
            leafs:[
                {
                    x:2,
                    y:-3,
                    dir:BOTTOM_LEFT
                },
                {
                    x:3,
                    y:-2,
                    dir:TOP_RIGHT
                }]
        },
        {
            x:1,
            y:-1,
            dir:BOTTOM_RIGHT,
            leafs:[
                {
                    x:2,
                    y:-3,
                    dir:BOTTOM_LEFT
                },
                {
                    x:3,
                    y:-2,
                    dir:TOP_RIGHT
                }]
        },
        {
            x:1,
            y:-1,
            dir:BOTTOM_LEFT,
            leafs:[{
                    x:2,
                    y:-3,
                    dir:BOTTOM_LEFT
                },
                {
                    x:3,
                    y:-2,
                    dir:TOP_RIGHT
                }]

        }
 ];

function buildClusterAt(room, offset, rotation)
{
    var built = 0;
    for(var i in extensionPattern )
    {
        var buildPosition = coordinates.getRotatedCoordinates(offset, extensionPattern[i].x, extensionPattern[i].y, rotation);
        console.log('building ' + extensionPattern[i].type + ' at ' + buildPosition.x + '/'+ buildPosition.y);
        if( extensionPattern[i].type == STRUCTURE_ROAD)
        {
            room.createConstructionSite(buildPosition, STRUCTURE_ROAD);
        } else 
        {
            if( OK == helper.buildOverRoad(room, buildPosition.x, buildPosition.y, extensionPattern[i].type))
                built ++;
        }
    }
    return built;
}

// this crap happens if your modulo group does not use index 0
function addOrientations( rot1, rot2 )
{
    return ((rot1 + rot2) % 9) + Math.floor( (rot1 + rot2)/9);
}

function buildExtensionCluster(room, offset, firstIndex, secondIndex)
{
    var built = 0;
    var cluster = extensionClusters[firstIndex];
    // first offset by base rotation
    var clusterOrientation = addOrientations(cluster.dir, room.memory.base_direction);
    // only rotate 90 increments, clusters are at 45 angles
    var clusterOffset = coordinates.getRotatedCoordinates(offset, cluster.x, cluster.y,  clusterOrientation - 1);
    console.log( JSON.stringify(clusterOffset)+ ' dir:' + clusterOrientation);
    if( secondIndex > 0)
    {
        var childCluster = cluster.leafs[secondIndex -1];
        clusterOffset = coordinates.getRotatedCoordinates(clusterOffset, childCluster.x, childCluster.y, clusterOrientation-1 );
        clusterOrientation = addOrientations(clusterOrientation, childCluster.dir);
    }
    console.log('Building extension cluster at: '+ JSON.stringify(clusterOffset)+ ', orientation: '+ clusterOrientation);
    built += buildClusterAt(room, clusterOffset, clusterOrientation -1);
    
    return built;
}

function findAndBuildNextExtensionCluster(room)
{
    var existing = room.find(FIND_MY_STRUCTURES, 
            { filter: (i) => i.structureType == STRUCTURE_EXTENSION} );        
    var constructing = room.find(FIND_MY_CONSTRUCTION_SITES, 
        { filter: (i) => i.structureType == STRUCTURE_EXTENSION} );
    var total = existing.length + constructing.length;
    if( total < extensionsForRCL[room.controller.level])
    {
        var toBuild = extensionsForRCL[room.controller.level] - total ;
        // one direction is the base, so calculate on base 3
        var base = Game.flags['Base1'];
        var smallestClusterIndex = Math.max(0,Math.floor(total/5));
        while( toBuild > 0 && smallestClusterIndex < 10)
        {
            var topLvlClusterIndex = smallestClusterIndex%3;
            var secondLvlClusterIndex = Math.floor(smallestClusterIndex / 3);
            console.log( topLvlClusterIndex);
            console.log( smallestClusterIndex);
            console.log( JSON.stringify(extensionClusters));

            var built = buildExtensionCluster(room, base.pos, topLvlClusterIndex, secondLvlClusterIndex);
            toBuild -= built;
            total += built;  
            smallestClusterIndex += 1;
            if(smallestClusterIndex > 8)
            {
                console.log('Out of extension locations! Revisit layout algorithm!');
                return false;
            }
        }
        if( toBuild == 0)
            return true;
    } 
    return false;
}
module.exports.buildExtensions = function(room)
    {
        findAndBuildNextExtensionCluster(room);
        //buildExtensionCluster(room, room.getPositionAt( 20,10), 0,0);
        //buildExtensionCluster(room, room.getPositionAt(20,10), 0,2);
    }
    
module.exports.seedBase = function(room)
    {
        var spawns = room.find(FIND_MY_SPAWNS);
        var spawn = spawns[0];
        
        var dx;
        var dy;
        var source = spawn.pos.findClosestByPath(FIND_SOURCES);
        if( source.pos.x >= spawn.pos.x)
        {
            if( source.pos.y <= spawn.pos.y)
            {
                room.memory.base_direction = BOTTOM_LEFT;
                dx = 3;
                dy = -3;
            } else 
            {
                room.memory.base_direction = TOP_LEFT;
                dx = 3;
                dy = 3;
            }
        } else 
        {
            if( source.pos.y <= spawn.pos.y)
            {
                room.memory.base_direction = BOTTOM_RIGHT;
                dx = -3;
                dy = -3;
            } else 
            {
                room.memory.base_direction = TOP_RIGHT;
                dx = -3;
                dy = 3;
            }
        }
        var baseX = spawn.pos.x + dx;
        var baseY = spawn.pos.y + dy;
            
        room.createFlag(baseX, baseY, "Base1");
    }

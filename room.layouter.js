const coordinates = require('coordinates');
const helper = require('helper');

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
    {   x:  1,
        y: -2,
        type: STRUCTURE_EXTENSION },
    {   x:  2,
        y: -1,
        type: STRUCTURE_EXTENSION },
    {   x:  2,
        y: -2,
        type: STRUCTURE_ROAD },
    {   x:  3,
        y: -3,
        type: STRUCTURE_EXTENSION },
    {   x:  2,
        y: -3,
        type: STRUCTURE_ROAD },
    {   x:  3,
        y: -2,
        type: STRUCTURE_ROAD },

    ];
    
const extensionClusters = [
        {
            x:1,
            y:-2,
            dir:TOP_RIGHT,
            leafs:[
                {
                    x:2,
                    y:-4,
                    dir:TOP_LEFT
                },
                {
                    x:4,
                    y:-2,
                    dir:BOTTOM_RIGHT
                }]
        },
        {
            x:1,
            y:1,
            dir:BOTTOM_RIGHT,
            leafs:[
                {
                    x:2,
                    y:-4,
                    dir:TOP_LEFT
                },
                {
                    x:4,
                    y:-2,
                    dir:BOTTOM_RIGHT
                }]
        },
        {
            x:-2,
            y:1,
            dir:BOTTOM_LEFT,
            leafs:[{
                    x:2,
                    y:-4,
                    dir:TOP_LEFT
                },
                {
                    x:4,
                    y:-2,
                    dir:BOTTOM_RIGHT
                }]

        },
        {
            x:-2,
            y:-2,
            dir:TOP_LEFT,
            leafs:[{
                    x:2,
                    y:-4,
                    dir:TOP_LEFT
                },
                {
                    x:4,
                    y:-2,
                    dir:BOTTOM_RIGHT
                }]

        } ];

function buildClusterAt(room, offset, rotation)
{
    for(var i in extensionPattern )
    {
        var buildPosition = coordinates.getRotatedCoordinates(offset, extensionPattern[i].x, extensionPattern[i].y, rotation);
        console.log('building ' + extensionPattern[i].type + ' at ' + buildPosition.x + '/'+ buildPosition.y);
        if( extensionPattern[i].type == STRUCTURE_ROAD)
        {
            
            room.createConstructionSite(buildPosition, STRUCTURE_ROAD);
        } else 
        {
            helper.buildOverRoad(room, buildPosition, extensionPattern[i].type);
        }
    }
}

function buildExtensionCluster(room, offset, firstIndex, secondIndex)
{
    var built = 0;
    var cluster = extensionClusters[firstIndex];
    // only rotate 90 increments, clusters are at 45 angles
    var clusterOrientation = cluster.dir -1;
    var clusterOffset = coordinates.getRotatedCoordinates(offset, cluster.x, cluster.y, TOP);
    if( secondIndex > 0)
    {
        var childCluster = cluster.leafs[secondIndex -1];
        clusterOffset = coordinates.getRotatedCoordinates(clusterOffset, childCluster.x, childCluster.y, cluster.dir-1 );
        clusterOrientation = ((clusterOrientation + childCluster.dir -3) % 8)+1;
    }
    console.log('Building extension cluster at: '+ JSON.stringify(clusterOffset)+ ', orientation: '+ clusterOrientation);
    built += buildClusterAt(room, clusterOffset, clusterOrientation);
    
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
        var smallestClusterIndex = Math.max(0,(total%5)-1);
        while( toBuild > 0 && smallestClusterIndex < 10)
        {
            var topLvlClusterIndex = smallestClusterIndex%3;
            var secondLvlClusterIndex = Math.floor(smallestClusterIndex / 3);
            var directionOfSpawn = (room.base_direction + 4) % 8;
            console.log( topLvlClusterIndex);
            console.log( smallestClusterIndex);
            console.log( JSON.stringify(extensionClusters));
            if( directionOfSpawn <= extensionClusters[topLvlClusterIndex].dir)
            {
                topLvlClusterIndex += 1;
            }

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
module.exports = {
    buildExtensions(room)
    {
        findAndBuildNextExtensionCluster(room);
        //buildExtensionCluster(room, room.getPositionAt( 20,10), 0,0);
        //buildExtensionCluster(room, room.getPositionAt(20,10), 0,2);
    }
};
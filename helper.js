/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('helper');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    buildOverRoad: function(room, x, y, type)
    {
        var pos = room.getPositionAt(x, y);

        const look = pos.look();
        if( look.length)
        {
            for( var i in look)
            {
                if( look[i].type == LOOK_STRUCTURES)
                {
                    if(look[i][LOOK_STRUCTURES].structureType == STRUCTURE_ROAD)
                    {
                        console.log('Demolished road at construction site for '+type+' at '+pos.x+'/'+pos.y);
                        look[i][LOOK_STRUCTURES].destroy();
                    } else if( look[i][LOOK_STRUCTURES].structureType == type)
                    {
                        console.log('Tried to build '+type+' at '+pos.x+'/'+pos.y+ ', but it already exists!');
                        return ERR_INVALID_TARGET;
                    } else 
                    {
                        console.log('Tried to build '+type+' at '+pos.x+'/'+pos.y+ ', but a '+look[i][LOOK_STRUCTURES].structureType+' blocks the position!');
                        return ERR_INVALID_TARGET;
                    }
                } else if ( look[i].type == LOOK_CONSTRUCTION_SITES)
                {
                    if(look[i][LOOK_CONSTRUCTION_SITES].structureType == STRUCTURE_ROAD)
                    {
                        console.log('Demolished road at construction site for '+type+' at '+pos.x+'/'+pos.y);
                        look[i][LOOK_CONSTRUCTION_SITES].remove();
                    } else if( look[i][LOOK_CONSTRUCTION_SITES].structureType == type)
                    {
                        console.log('Tried to build '+type+' at '+pos.x+'/'+pos.y+ ', but it is already in progress!');
                        return ERR_INVALID_TARGET;
                    } else 
                    {
                        console.log('Tried to build '+type+' at '+pos.x+'/'+pos.y+ ', but a '+look[i][LOOK_CONSTRUCTION_SITES].structureType+' construction site blocks the position!');
                        return ERR_INVALID_TARGET;
                    }
                    
                }
            }
        }
        return room.createConstructionSite(pos, type);
    },
    destroyConstruction: function( room)
    {
    var blueprints = room.find( FIND_MY_CONSTRUCTION_SITES);
    blueprints.forEach((s) => s.remove());

    },
    
    createLink: function( room, startLink, endLink)
    {
        if( ! room.memory.links)
        {
            room.memory.links = [];
        }
        var newLink = {};
        newLink['from'] = startLink.id;
        newLink['to'] = endLink.id;
        room.memory.links.push(newLink);
    },
    
    createConduit: function( room, position, from, to)
    {
        if( !room.memory.conduits)
        {
            room.memory.conduits = [];
        }
        var newConduit = {};
        newConduit['pos'] = position;
        newConduit['from'] = from;
        newConduit['to'] = to;
        room.memory.conduits.push(newConduit);
    }

};

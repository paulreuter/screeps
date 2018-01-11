/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('helper');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    buildOverRoad: function(room, arg1, arg2, arg3)
    {
        console.log('BuildOverRoad: '+ JSON.stringify(arg1)+', '+JSON.stringify(arg2)+', '+JSON.stringify(arg3));
        var pos;
        var type;
        if( arg1 instanceof RoomPosition)
        {
            pos = arg1;
            type = arg2;
        } else 
        {
            pos = room.getPositionAt(arg1, arg2);
            type = arg3;
        }
        
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
                        return OK;
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
                        return OK;
                    } else 
                    {
                        console.log('Tried to build '+type+' at '+pos.x+'/'+pos.y+ ', but a '+look[i][LOOK_CONSTRUCTION_SITES].structureType+' construction site blocks the position!');
                        return ERR_INVALID_TARGET;
                    }
                    
                }
            }
        }
        return room.createConstructionSite(pos, type);
    }
};
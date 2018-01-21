/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('coordinates');
 * mod.thing == 'a thing'; // true
 */
const xtransform = [1,0, 0,-1, -1,0, 0,1 ];
const ytransform = [0,1, 1,0, 0,-1, -1,0];



module.exports = {
    getRotatedCoordinates: function(offset,x,y, dir)
    {
        if( dir%2 != 1)
        {
            console.log('Tried to rotate to diagonal, check results!');
            dir = dir -1;
        }
        var newX = offset.x+ xtransform[(dir-1)]* x + xtransform[dir]*y;
        var newY = offset.y + ytransform[dir-1]* x + ytransform[dir]*y;
        return Game.rooms[offset.roomName].getPositionAt(newX, newY);
    }
    
};
module.exports = {};

function formatElement( element)
{
    return element.structureType+':'+ element.hits+'/'+element.hitsMax+'@'+element.pos.x+':'+element.pos.y;
}

function outputList(list)
{
    console.log( list.reduce( (out, element)=>{ 
        // console.log('Debugging reduce: out='+ JSON.stringify(out)+ ' , element='+JSON.stringify(element));
        return out+',  '+formatElement(element)}, 'List'));
}

module.exports.recalculateRepairList = function(room)
{
    var nonHealthyOwned = room.find(FIND_MY_STRUCTURES, {filter: 
        (s)=> { 
            return s.hits < s.hitsMax;}});
    if( ! nonHealthyOwned)
        nonHealthyOwned = [];
    var nonHealthyCivilians = room.find(FIND_STRUCTURES, 
        {filter: 
        (s)=> {
                if( s.structureType == STRUCTURE_WALL)
                    return s.hits < room.memory.wallhp;
                if( s.structureType == STRUCTURE_RAMPART)
                    return s.hits < room.memory.ramparthp;
                return s.hits < s.hitsMax;
            }});
    // console.log( 'Repair list structures');
    var allNonHealthy = nonHealthyCivilians.concat(nonHealthyOwned);
    // outputList( allNonHealthy);
    allNonHealthy = _.sortBy(allNonHealthy, (s)=> {
        if( s.structureType == STRUCTURE_WALL)
            return s.hits / room.memory.wallhp +1;
        if( s.structureType == STRUCTURE_RAMPART)
        {
            if( s.hits <= RAMPART_DECAY_AMOUNT * 10)
                return 0;
            return s.hits / room.memory.ramparthp + 1;
        }
        return s.hits < s.hitsMax;
        } );
    // outputList( allNonHealthy);
    room.memory.repair = {};
    room.memory.repair.time = Game.time;
    room.memory.repair.list = allNonHealthy.map( (s)=> s.id);
    
}

module.exports.increaseFortificationStrength = function( room)
{
    if( room.memory.wallhp && room.memory.ramparthp) {
        room.memory.wallhp = room.memory.wallhp + 20000;
        room.memory.ramparthp = room.memory.ramparthp + 20000
    } else {
        room.memory.wallhp = 20000;
        room.memory.ramparthp = 20000;
    }
}


module.exports.getCivilianRepairList = function(room)
{
    if(!room.memory.repair)
    {
        room.memory.repair = {};
        room.memory.repair.list = [];
        room.memory.repair.time  = 0;
    }
    if(Game.time - room.memory.repair.time > 1 )
    {
        module.exports.recalculateRepairList(room);
    } 
    return room.memory.repair.list;
}



var roleMiner = {
    /** @param {Creep} creep **/
    run: function(creep) {
        if( creep.spawning)
        {
            return;
        }
        var desiredSource = creep.memory.mySource;
        if( desiredSource == 0 || desiredSource == null)
        {
            console.log(creep + ' looking for a source to mine');
            var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
            var sources = creep.room.find(FIND_SOURCES);
            sources.sort((a,b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));
            for(var i in sources) {
                var id = sources[i].id;
                var claimed = false;
                for( var j in miners)
                {
                    var minername = miners[j].name;
//                    console.log('Trying to look at ' + miners[j].name);
                    if( miners[j] != creep && miners[j] != null)
                    {
//                        console.log('Inspecting target of '+ minername);
                        if( miners[j].memory.mySource == id)
                        {
//                            console.log(minername + 'already works on '+id);
                            claimed = true;
                            break;
                        }
                    }
                }
                if( claimed)
                {
                    continue;
                }
                creep.memory.mySource = id;
                desiredSource = id;
                console.log(sources[i].pos);
                var flagInRange = sources[i].pos.findClosestByPath(FIND_FLAGS);
                console.log(JSON.stringify(flagInRange));
                creep.memory.flag = sources[i].pos.findClosestByRange(FIND_FLAGS).name;
                break;
            }
            
        }
        
        var source = Game.getObjectById(desiredSource);
            
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            // creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            creep.moveTo(Game.flags[creep.memory.flag], {visualizePathStyle: {stroke: '#ffaa00'}});
        } 
    }
};

module.exports = roleMiner;

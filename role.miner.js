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
            // console.log(creep + ' looking for a source to mine');
            var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
            var sources = creep.room.find(FIND_SOURCES);
            sources.sort((a,b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b));
            var lowestClaim = {};
            lowestClaim.claim = 99;
            for(var i in sources) {
                var id = sources[i].id;
                var claimed = 0;
                for( var j in miners)
                {
                    var minername = miners[j].name;
                    if( miners[j] != creep && miners[j] != null)
                    {
                        if( miners[j].memory.mySource == id)
                        {
                            claimed++;
                        }
                    }
                }
                if( claimed < lowestClaim.claim)
                {
                    lowestClaim.claim = claimed;
                    lowestClaim.source = i;
                }
            }
            
            creep.memory.mySource = sources[lowestClaim.source].id;
            desiredSource = sources[lowestClaim.source].id;
            
            creep.memory.flag = sources[lowestClaim.source].pos.findClosestByRange(FIND_FLAGS).name;
        }
        
        var source = Game.getObjectById(desiredSource);
            
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            // creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            creep.moveTo(Game.flags[creep.memory.flag], {visualizePathStyle: {stroke: '#ffaa00'}});
            const occupier = Game.flags[creep.memory.flag].pos.lookFor(LOOK_CREEPS);
            if( occupier.length)
            {
                if( occupier[0] != creep && occupier[0].memory.role == 'miner')
                {
                    creep.moveTo(source,{visualizePathStyle: {stroke: '#ffaa00'}} );
                }
            }
        } 
    }
};

module.exports = roleMiner;

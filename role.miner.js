var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var target = creep.memory.target;
        if( target == null)
        {
            var sources = creep.room.find(FIND_SOURCES);
            for(var source in sources)
            {
                var occupied = false;
                for(var name in Game.creeps) {
                    var other = Game.creeps[name];
                    if(other.memory.target == source.id ) {
                        occupied = true;
                        break;
                    }
                }
                if( !occupied)
                {
                    creep.memory.target = source.id;
                    break;
                }
            }
        }
        var source = Game.getObjectById(target);
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        }    
    }
};

module.exports = roleMiner;

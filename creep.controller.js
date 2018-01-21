
var roleCarrier = require('role.carrier');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMiner = require('role.miner');
var roleHousekeeper = require('role.housekeeper');
var roleUpgrader = require('role.upgrader');

const known_roles = {
    housekeeper: roleHousekeeper,
    miner: roleMiner,
    builder: roleBuilder,
    upgrader: roleUpgrader,
    carrier: roleCarrier
}



function wantToBuild(spawn, thisRole)
{
    // console.log( 'trying to build '+ thisRole + ' in spawn '+spawn.name);
    var existing = _.filter(Game.creeps, (creep) => creep.memory.role == thisRole);
    // console.log('checking on existing '+thisRole+'s:' + existing.length+'/'+ spawn.room.memory['desired_'+thisRole+'s']);
    if(existing.length < spawn.room.memory['desired_' + thisRole + 's']) {
        var status = spawn.spawnCreep(spawn.room.memory[thisRole + '_configuration'], 'newName', {dryRun: true});
        if(   status == OK )
        {
            var newName = thisRole + ' ' + Game.time;
            var status = spawn.spawnCreep(spawn.room.memory[thisRole + '_configuration'], newName,  {memory: {role: thisRole}});
            if( OK ==  status)
            {
                console.log('Spawning new '+thisRole+': ' + newName);
                // console.log('with role:' +Game.creeps[newName].memory.role);
            }
        } else {
            if( status == ERR_NOT_ENOUGH_ENERGY)
            {
                console.log( 'Not enough energy for:'+spawn.room.memory[thisRole+'_configuration, resettting configurations']);
                var conf = require('creep.configuration');
                conf.refreshConfigurations(spawn.room);
                
            }
            console.log('spawning failed, status:' + status);
        }
        return true;
    }
    return false;
}

module.exports = {
    setDesiredForRole: function(room, role, amount)
    {
        // console.log( 'setting ' + role + ' to '+ amount );
        room.memory['desired_'+role+'s']  = amount;
        
        var totals = 0;
        for( var i in known_roles)
        {
            var value = room.memory['desired_'+i+'s'];
            if( value)
            {
                totals += value;
            }
        }
        room.memory['desired_total'] = totals;
        // console.log('new desired for '+role+': '+ room.memory['desired_'+role+'s']);
        // console.log('new desired for all: '+ room.memory['desired_total']);
    },
    run: function(spawn)
    {
        var room = spawn.room;
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            known_roles[creep.memory.role].run(creep);
        }
        
        var totalCreeps = Object.keys(Game.creeps).length;
        // console.log('checking creeps: '+totalCreeps + '/'+ room.memory.desired_total);
        if( totalCreeps < room.memory.desired_total)
        {
            for(var name in Memory.creeps) {
                if(!Game.creeps[name]) {
                    delete Memory.creeps[name];
                }
            }
            if( room.energyAvailable == room.energyCapacityAvailable)
            {
                for( var i in known_roles)
                {
                    if( wantToBuild(spawn, i))
                        break;
                }
            }  
            if ( totalCreeps == 0)
            {
                // emergency spawning needed
                spawn.createSpawn([WORK,CARRY, CARRY, MOVE, MOVE], 'housekeeper emergency', {memory:{role:'housekeeper', obsolete:true}});
            }
        }
        if(spawn.spawning) {
            var spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});
        }
    }
};
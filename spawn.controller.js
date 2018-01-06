
var states = require('spawn.states');

const STATE_BOOTSTRAP_PRIMARY_MINING = 1;
const STATE_BOOTSTRAP_ALL_MINING = 2;
const STATE_BOOTSTRAP_EXTENSIONS = 3;
const STATE_BOOTSTRAP_CONTAINER = 4;
const STATE_BOOTSTRAP_CONTROLLER = 5;
const STATE_BOOTSTRAP_DEFENSES = 6;

Memory.state_machine = {
    STATE_BOOTSTRAP_PRIMARY_MINING: {condition: states.CONDITION_SOURCE_HAS_CONTAINER_BUILT, action: states.ACTION_ALL_MINING, next_state: states.STATE_BOOTSTRAP_ALL_MINING },
    STATE_BOOTSTRAP_ALL_MINING: {condition: states.CONDITION_ALL_SOURCES_HAVE_CONTAINERS, action: states.ACTION_MINING_DONE, next_state: states.STATE_BOOTSTRAP_EXTENSIONS },
    STATE_BOOTSTRAP_EXTENSIONS: {condition: states.CONDITION_ONE_CONTAINER_BUILT, action: states.ACTION_PHASE_TWO, next_state: states.STATE_BOOTSTRAP_CONTAINER },
    STATE_BOOTSTRAP_CONTAINER: {condition: states.CONDITION_RCL_LEVEL_TWO, action: states.ACTION_BUILD_EXTENSIONS, next_state: states.STATE_BOOTSTRAP_EXTENSIONS }
};

function evaluateState(spawn) {
    if( (!spawn.room.memory.state) && spawn && spawn.pos)
    {
        states.INITIALIZE(spawn);
        console.log('Room initialized, switching to BOOTSTRAP_PRIMARY_MINING');
        spawn.room.memory.state = STATE_BOOTSTRAP_PRIMARY_MINING;
    }
    if( Game.time % 10 == 0)
    {
        var currentState = Memory.state_machine.STATE_BOOTSTRAP_PRIMARY_MINING.condition;
        console.log(JSON.stringify(currentState));
        switch( spawn.room.memory.state)
        {
            case STATE_BOOTSTRAP_PRIMARY_MINING:
                if( states.CONDITION_SOURCE_HAS_CONTAINER_BUILT(spawn) )
                {
                    states.ACTION_MINING_DONE(spawn);
                    console.log('Switching to BOOTSTRAP_CONTAINER');
                    spawn.room.memory.state = STATE_BOOTSTRAP_CONTAINER;
                }
                break;
            case STATE_BOOTSTRAP_CONTAINER:
                if( states.CONDITION_RCL_LEVEL_TWO(spawn))
                {
                    states.ACTION_BUILD_EXTENSIONS(spawn);
                    console.log('Switching to BOOTSTRAP_EXTENSIONS');
                    spawn.room.memory.state = STATE_BOOTSTRAP_EXTENSIONS;
                }
                break;
        }
    }
}

module.exports = {

    run: function(spawn) {
        evaluateState(spawn);
        
        var totalCreeps = Object.keys(Game.creeps).length;
        if( totalCreeps < spawn.memory.desired_carriers + spawn.memory.desired_builders + spawn.memory.desired_upgraders + spawn.memory.desired_miners)
        {
            for(var name in Memory.creeps) {
                if(!Game.creeps[name]) {
                    delete Memory.creeps[name];
                    console.log('Clearing non-existing creep memory:', name);
                }
            }
    
            var carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier');
            var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
            var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
            var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
            if(miners.length < spawn.memory.desired_miners) {
                if( spawn.spawnCreep(spawn.memory.miner_configuration, 'newName', {dryRun: true}) == OK )
                {
                    var newName = 'Miner ' + Game.time;
                    if( OK == spawn.spawnCreep(spawn.memory.miner_configuration, newName,  {memory: {role: 'miner'}}) )
                    {
                        console.log('Spawning new miner: ' + newName);
                    }
                }
            } else if(builders.length < spawn.memory.desired_builders) {
                if( spawn.spawnCreep(spawn.memory.builder_configuration, 'newName', {dryRun: true}) == 0 )
                {
                    var newName = "Builder " + Game.time;
                    if( OK == spawn.spawnCreep(spawn.memory.builder_configuration, newName, {memory: {role: 'builder'}}) )
                    {
                        console.log('Spawning new builder: ' + newName);
                    }
                }
            } else if(carriers.length < spawn.memory.desired_carriers) {
                if( spawn.spawnCreep(spawn.memory.carrier_configuration, 'newName', {dryRun: true}) == 0 )
                {
                    var newName = "Carrier " + Game.time;
                    if( OK == spawn.spawnCreep(spawn.memory.carrier_configuration, newName, {memory: {role: 'carrier'}}) )
                    {
                        console.log('Spawning new carrier: ' + newName);
                    }
                }
            } else if(upgraders.length < spawn.memory.desired_upgraders) {
                if( spawn.spawnCreep(spawn.memory.builder_configuration, 'newName', {dryRun: true}) == 0 )
                {
                    var newName = "Upgrader " + Game.time;
                    if( OK == spawn.spawnCreep(spawn.memory.builder_configuration, newName, {memory: {role: 'upgrader'}}) )
                    {
                        console.log('Spawning new upgrader: ' + newName);
                    }
                }
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
const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require('discord-buttons')(client);

const config = require('./config.json');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

let channelInfo;
let roleInfo;
let serverInfo;

let messageEmbed;

let contestants = {
    "user": "",
    "answer": ""
}

let numContestants = 0;

client.on('message', msg => {
    if (msg.content === '!start') {
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
        .setDescription('Trivia starts in 1 hour! Sign up using the button below!')
        .setTimestamp()
        .setFooter(`${numContestants} registered`, 'https://i.imgur.com/dhA5PXS.png');

        const button = new disbut.MessageButton()
        .setStyle('green')
        .setLabel('Sign up')
        .setID('signup')

        msg.channel.send({ button: button, embed: exampleEmbed }).then (msg2 => {
            messageEmbed = msg2;
        });
    } else if (msg.content === '!start2') {
        // Disable the signup button and edit the message
        const button = new disbut.MessageButton()
        .setStyle('green')
        .setLabel('Sign up')
        .setID('signup')
        .setDisabled ();

        messageEmbed.edit ({ button: button, embed: messageEmbed [0] });


    }
});

client.on('clickButton', async (button) => {
    if (button.id === 'signup') {
        let roleExist = false;
        let i;

        for (i = 0; i < numContestants; i ++) {
            if (button.clicker.user.id == contestants [i].user.user.id) {
                roleExist = true;
            }
        }

        if (roleExist == false) {
            // First give the member the contestant role
            let role = button.clicker.member.guild.roles.cache.find(r => r.name === "Trivia Contestant");

            button.clicker.member.roles.add (role).catch(console.error);
            numContestants ++;

            // Then update the embed with the number of registrants
            const receivedEmbed = messageEmbed [0];
            const newEmbed = new Discord.MessageEmbed (receivedEmbed)
            .setColor('#0099ff')
            .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
            .setDescription('Trivia starts in 1 hour! Sign up using the button below!')
            .setTimestamp()
            .setFooter (`${numContestants} registered`, 'https://i.imgur.com/dhA5PXS.png');

            messageEmbed.edit (newEmbed);

            // Add user to the array of contestants
            contestants [numContestants - 1] = {
                "user": button.clicker,
                "answer": "blank"
            }
        }
    }
});

client.on("guildCreate", guild => {
    serverInfo = guild;

    const channel = guild.channels.create ('trivia', { reason: 'Need a dedicated trivia channel' })
    .then(result => {
        channelInfo = result;
    })
    .catch(console.error);

    const role = guild.roles.create({
        data: {
            name: 'Trivia Contestant',
            color: 'BLUE',
        },
        reason: 'Need a role for the contestants to keep track of things',
    })
    .then(result => {
        roleInfo = result;
    })
    .catch(console.error);
});

client.on('error', (err) => {
    let date = new Date().toLocaleString();
    console.log (`Internet outage at: ${date}`);
});

client.login(config.discord.token);

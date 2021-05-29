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

let i;

let contestants = {
    "user": "",
    "answer": ""
}

let questions = {
    "questions": ["In which continent is Mongolia located?", "What type of meat is on a traditional Reuben sandwich?", "What part of the world was once known as Cathay?", "What kind of animal is a peregrine?", "What is your astrological sign if you were born on Halloween?"],
    "answer1": ["Asia", "Turkey", "Japan", "Bird", "Capricorn"],
    "answer2": ["Europe", "Bologna", "China", "Fish", "Scorpio"],
    "answer3": ["Oceania", "Corned Beef", "India", "Cat", "Libra"],
    "answer": ["Asia", "Corned Beef", "China", "Bird", "Scorpio"],
    "category": ["Geography", "Food", "History", "Animals", "Astrology"]
}

let numContestants = 0;
let numAnswers = 0;

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
        game (msg);
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
        } else if (button.id === 'answer1') {
            for (i = 0; i < numContestants; i ++) {
                if (button.clicker.user.id == contestants [i].user.user.id) {
                    contestants [i].answer = "green";
                }
            }
        } else if (button.id === 'answer2') {
            for (i = 0; i < numContestants; i ++) {
                if (button.clicker.user.id == contestants [i].user.user.id) {
                    contestants [i].answer = "blurple";
                }
            }
        } else if (button.id === 'answer3') {
            for (i = 0; i < numContestants; i ++) {
                if (button.clicker.user.id == contestants [i].user.user.id) {
                    contestants [i].answer = "red";
                }
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

async function game (msg) {
    // Disable the signup button and edit the message
    const button = new disbut.MessageButton()
    .setStyle('green')
    .setLabel('Sign up')
    .setID('signup')
    .setDisabled ();

    messageEmbed.edit ({ button: button, embed: messageEmbed [0] });

    for (i = 0; i < 5; i ++) {
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
        .setTitle ('The next category is:')
        .setDescription(`${questions.category [i]}`)
        .setTimestamp()

        msg.channel.send (exampleEmbed);

        await sleep (5000);

        const exampleEmbed2 = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
        .setTitle (`${questions.questions [i]}`)
        .setDescription ('You have 15 seconds to answer')
        .setTimestamp()
        .setFooter(`${numAnswers} answered`, 'https://i.imgur.com/dhA5PXS.png');

        let answer1 = new disbut.MessageButton()
        .setStyle('green')
        .setLabel(`${questions.answer1 [i]}`)
        .setID('answer1')

        let answer2 = new disbut.MessageButton()
        .setStyle('blurple')
        .setLabel(`${questions.answer2 [i]}`)
        .setID('answer2')

        let answer3 = new disbut.MessageButton()
        .setStyle('red')
        .setLabel(`${questions.answer3 [i]}`)
        .setID('answer3')

        msg.channel.send({
            buttons: [
                answer1, answer2, answer3
            ],
            embed: exampleEmbed2 }).then (msg2 => {
                messageEmbed = msg2;
            });

        answer1 = new disbut.MessageButton()
        .setStyle('green')
        .setLabel(`${questions.answer1 [i]}`)
        .setID('answer1')
        .setDisabled ()

        answer2 = new disbut.MessageButton()
        .setStyle('blurple')
        .setLabel(`${questions.answer2 [i]}`)
        .setID('answer2')
        .setDisabled ()

        answer3 = new disbut.MessageButton()
        .setStyle('red')
        .setLabel(`${questions.answer3 [i]}`)
        .setID('answer3')
        .setDisabled ()

        await sleep (15000);

        messageEmbed.edit ({
            buttons: [
                answer1, answer2, answer3
            ],
            embed: exampleEmbed2 }).then (msg2 => {
                messageEmbed = msg2;
            });

        const exampleEmbed3 = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
        .setTitle ('Time\'s up!')
        .setDescription (`The answer was: ${questions.answer [i]}`)

        msg.channel.send (exampleEmbed3);

        await sleep (5000);
    }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

client.login(config.discord.token);

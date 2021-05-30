const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require('discord-buttons')(client);

const config = require('./config.json');

let channelInfo;
let roleInfo;
let serverInfo;

let messageEmbed;

let i;
let j;

let contestants = {
    "user": "",
    "answer": ""
}

let contestantsArray = new Array ();

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

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

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
    button.defer ()
    // Remember to put this listener in my signup function when I make it because it won't work otherwise
    if (button.id === 'signup') {
        let roleExist = false;
        let i;

        for (i = 0; i < numContestants; i ++) {
            if (button.clicker.user.id == contestantsArray [i].user.user.id) {
                roleExist = true;
            }
        }

        if (roleExist == false) {
            // First give the member the contestant role
            let role = await button.clicker.member.guild.roles.cache.find(r => r.name === "Trivia Contestant");

            await button.clicker.member.roles.add (role).catch(console.error);
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
            let temp = {
                "user": button.clicker,
                "answer": "blank"
            }

            contestantsArray.push (temp);
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

    numAnswers = 0;

    client.on('clickButton', async (button) => {
        if (button.id === 'answer1') {
            for (j = 0; j < numContestants; j ++) {
                if (button.clicker.user.id == contestantsArray [j].user.user.id) {
                    if (contestantsArray [j].answer.localeCompare ("blank") == 0) {
                        numAnswers ++;
                    }

                    contestantsArray [j].answer = questions.answer1 [i];
                }
            }
        } else if (button.id === 'answer2') {
            for (j = 0; j < numContestants; j ++) {
                if (button.clicker.user.id == contestantsArray [j].user.user.id) {
                    if (contestantsArray [j].answer.localeCompare ("blank") == 0) {
                        numAnswers ++;
                    }

                    contestantsArray [j].answer = questions.answer2 [i];
                }
            }
        } else if (button.id === 'answer3') {
            for (j = 0; j < numContestants; j ++) {
                if (button.clicker.user.id == contestantsArray [j].user.user.id) {
                    if (contestantsArray [j].answer.localeCompare ("blank") == 0) {
                        numAnswers ++;
                    }

                    contestantsArray [j].answer = questions.answer3 [i];
                }
            }
        }
    });

    for (i = 0; i < 5; i ++) {
        // Set all player answers to blank again and set numAnswers to 0
        numAnswers = 0;

        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
        .setTitle (`Round ${(i + 1)} of 5`) // Change the 5 depending on the number of questions
        .setDescription(`The category is: ${questions.category [i]}!`)
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

        let timer;
        let newEmbed;

        for (timer = 12; timer > -1; timer -= 3) {
            await sleep (3000);

            newEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
            .setTitle (`${questions.questions [i]}`)
            .setDescription (`You have ${timer} seconds to answer`)
            .setTimestamp()
            .setFooter(`${numAnswers} answered`, 'https://i.imgur.com/dhA5PXS.png');

            messageEmbed.edit ({
                buttons: [
                    answer1, answer2, answer3
                ],
                embed: newEmbed }).then (msg2 => {
                    messageEmbed = msg2;
                });
        }

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

        newEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
        .setTitle (`${questions.questions [i]}`)
        .setDescription (`You have 0 seconds to answer`)
        .setTimestamp()
        .setFooter(`${numAnswers} answered`, 'https://i.imgur.com/dhA5PXS.png');

        messageEmbed.edit ({
            buttons: [
                answer1, answer2, answer3
            ],
            embed: newEmbed }).then (msg2 => {
                messageEmbed = msg2;
            });

        const exampleEmbed3 = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
        .setTitle ('Time\'s up!')
        .setDescription (`The answer was: ${questions.answer [i]}`)

        msg.channel.send (exampleEmbed3);

        await sleep (7000);

        // Figure out who got it right, kick out the ones that didn't, then ping the ones who did and say how many got it right
        let anyCorrect = false;

        for (j = 0; j < numContestants; j ++) {
            if (contestantsArray [j].answer.localeCompare (questions.answer [i]) == 0) {
                anyCorrect = true;
                break;
            }
        }

        if (anyCorrect == false) {
            // If nobody got it correct, the winners are everyone from who made it to this round
            let mention = (`<@${contestantsArray [0].user.user.id}>`);

            for (j = 1; j < numContestants; j ++) {
                let concatString = (`\n<@${contestantsArray [j].user.user.id}>`);
                mention = mention.concat (concatString);
            }

            const winnerEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
            .setTitle ('The game is over!')
            .addField ('The winners are:', mention)
            .setTimestamp()

            msg.channel.send (winnerEmbed);

            for (j = numContestants - 1; j > -1; j --) {
                let role = contestantsArray [j].user.member.guild.roles.cache.find(r => r.name === "Trivia Contestant");

                contestantsArray [j].user.member.roles.remove (role).catch(console.error);

                contestantsArray.splice (j, 1);
                numContestants --;
            }

            break;
        } else {
            // Otherwise find the people who got it wrong and kick them out
            for (j = numContestants - 1; j > -1; j --) {
                if (contestantsArray [j].answer.localeCompare (questions.answer [i]) != 0) {
                    let role = contestantsArray [j].user.member.guild.roles.cache.find(r => r.name === "Trivia Contestant");

                    contestantsArray [j].user.member.roles.remove (role).catch(console.error);

                    // Figure out how to remove element from an array
                    contestantsArray.splice (j, 1);
                    numContestants --;
                }
            }

            if (numContestants == 1) {
                // If there's one person left then the game is over with 1 winner
                let mention = (`<@${contestantsArray [0].user.user.id}>`);

                const winnerEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
                .setTitle ('The game is over!')
                .addField ('The winner is:', mention)
                .setTimestamp()

                msg.channel.send (winnerEmbed);

                let role = contestantsArray [0].user.member.guild.roles.cache.find(r => r.name === "Trivia Contestant");

                contestantsArray [0].user.member.roles.remove (role).catch(console.error);

                break;
            }
        }

        // Print the role and announce how many people got the right answer here
        const nextRoundEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
        .setTitle (`${numContestants} contestants got that question right!`)
        .setDescription ('1 minute until the next round!\nIf you receive a ping then you are eligible for the next round!')
        .setTimestamp()

        msg.channel.send (nextRoundEmbed);

        let role = contestantsArray [0].user.member.guild.roles.cache.find(r => r.name === "Trivia Contestant");

        msg.channel.send (`<@&${role.id}>`);

        for (j = 0; j < numContestants; j ++) {
            contestantsArray [j].answer = "blank";
        }

        await sleep (5000);
    }

    // If there are still players left after all questions have been exhausted then the game is over
    // Write all winners here
    if (numContestants > 1) {
        let mention = (`<@${contestantsArray [0].user.user.id}>`);

        for (j = 1; j < numContestants; j ++) {
            let concatString = (`\n<@${contestantsArray [j].user.user.id}>`);
            mention = mention.concat (concatString);
        }

        const winnerEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
        .setTitle ('The game is over!')
        .addField ('The winners are:', mention)
        .setTimestamp()

        msg.channel.send (winnerEmbed);

        // Then remove the contestant role from everyone
        for (j = numContestants - 1; j > -1; j --) {
            let role = contestantsArray [j].user.member.guild.roles.cache.find(r => r.name === "Trivia Contestant");

            contestantsArray [j].user.member.roles.remove (role).catch(console.error);

            contestantsArray.splice (j, 1);
            numContestants --;
        }
    }
}

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

client.login(config.discord.token);

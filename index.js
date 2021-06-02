const Discord = require('discord.js');
const client = new Discord.Client();
const disbut = require('discord-buttons')(client);

const config = require('./config.json');

let channelInfo;
let roleInfo;
let serverInfo;

let latestEmbed; // This stores the most recently sent embed so that I can edit it when needed

let i, j;

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
let numRounds = 5; // Change this depending on the number of rounds you want to have

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("guildCreate", guild => {
    serverInfo = guild;

    guild.channels.create ('trivia', { reason: 'Need a dedicated trivia channel' })
    .then(result => {
        channelInfo = result;
    })
    .catch(console.error);

    guild.roles.create({
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

client.on('message', msg => {
    if (msg.content === '!start') {
        let signupEmbed = createSignupEmbed ();
        let signupButton = createButtons ('green', 'Sign up', 'signup', false);

        msg.channel.send({ button: signupButton, embed: signupEmbed }).then (msg2 => {
            latestEmbed = msg2;
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
            latestEmbed.edit (createSignupEmbed ());

            // Add user to the array of contestants
            contestantsArray.push ({
                "user": button.clicker,
                "answer": "blank"
            });
        }
    }
});

client.on('error', (err) => {
    let date = new Date().toLocaleString();
    console.log (`Internet outage at: ${date}`);
});

async function game (msg) {
    // Disable the signup button and edit the message
    let signupButton = createButtons ('green', 'Sign up', 'signup', true);

    latestEmbed.edit ({ button: signupButton, embed: latestEmbed [0] });

    // These onclick listeners need to be inside the async function otherwise they don't work during the sleeps
    client.on('clickButton', async (button) => {
        if (button.id === 'answer1' || button.id === 'answer2' || button.id === 'answer3') {
            answer (button);
        }
    });

    for (i = 0; i < numRounds; i ++) {
        // Set all player answers to blank again and set numAnswers to 0
        numAnswers = 0;

        let roundAnnounceEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
        .setTitle (`Round ${(i + 1)} of ${numRounds}`)
        .setDescription(`The category is: ${questions.category [i]}!`)
        .setTimestamp()

        msg.channel.send (roundAnnounceEmbed);

        await sleep (5000); // Wait 5 seconds after announcing the category to post the question

        let timer = 15;
        let questionEmbed = createQuestionEmbed (timer);

        let answer1 = createButtons ('green', questions.answer1 [i], 'answer1', false);
        let answer2 = createButtons ('blurple', questions.answer2 [i], 'answer2', false);
        let answer3 = createButtons ('red', questions.answer3 [i], 'answer3', false);

        msg.channel.send({
            buttons: [
                answer1, answer2, answer3
            ],
            embed: questionEmbed }).then (msg2 => {
                latestEmbed = msg2;
            });

        for (timer = 12; timer > -1; timer -= 3) {
            await sleep (3000);

            questionEmbed = createQuestionEmbed (timer);

            latestEmbed.edit ({
                buttons: [
                    answer1, answer2, answer3
                ],
                embed: questionEmbed }).then (msg2 => {
                    latestEmbed = msg2;
                });
        }

        answer1 = createButtons ('green', questions.answer1 [i], 'answer1', true);
        answer2 = createButtons ('blurple', questions.answer2 [i], 'answer2', true);
        answer3 = createButtons ('red', questions.answer3 [i], 'answer3', true);

        timer = 0;
        questionEmbed = createQuestionEmbed (timer);

        latestEmbed.edit ({
            buttons: [
                answer1, answer2, answer3
            ],
            embed: questionEmbed }).then (msg2 => {
                latestEmbed = msg2;
            });

        const timeOverEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
        .setTitle ('Time\'s up!')
        .setDescription (`The answer was: ${questions.answer [i]}`)

        msg.channel.send (timeOverEmbed);

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
            printWinners (msg);
            roleReset ();
            break;
        } else {
            // Otherwise find the people who got it wrong and kick them out
            for (j = numContestants - 1; j > -1; j --) {
                if (contestantsArray [j].answer.localeCompare (questions.answer [i]) != 0) {
                    removeRole ();
                }
            }

            if (numContestants == 1) {
                // If there's one person left then the game is over
                printWinners (msg);
                roleReset ();
                break;
            }
        }

        await sleep (3000);

        // Print the role and announce how many people got the right answer here
        if ((i + 1) != numRounds) {
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
    }

    // If there are still players left after all questions have been exhausted then the game is over
    // Write all winners here
    printWinners (msg);

    // Then remove the contestant role from everyone
    roleReset ();
}

function answer (button) {
    // For all contestants, find if the user is in the contestants array
    // If they're not it means they're out of the game
    for (j = 0; j < numContestants; j ++) {
        if (button.clicker.user.id == contestantsArray [j].user.user.id) {
            // Once found check if this is their first answer of the round and if so increment the number of answers
            if (contestantsArray [j].answer.localeCompare ("blank") == 0) {
                numAnswers ++;
            }

            // Then figure out which option they picked and set their answer accordingly
            if (button.id === 'answer1') {
                contestantsArray [j].answer = questions.answer1 [i];
            } else if (button.id === 'answer2') {
                contestantsArray [j].answer = questions.answer2 [i];
            } else if (button.id === 'answer3') {
                contestantsArray [j].answer = questions.answer3 [i];
            }
        }
    }
}

function createSignupEmbed () {
    let signupEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
    .setDescription('Trivia starts in 1 hour! Sign up using the button below!')
    .setTimestamp()
    .setFooter(`${numContestants} registered`, 'https://i.imgur.com/dhA5PXS.png');

    return signupEmbed;
}

function createQuestionEmbed (timer) {
    let questionEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
    .setTitle (`${questions.questions [i]}`)
    .setDescription (`You have ${timer} seconds to answer`)
    .setTimestamp()
    .setFooter(`${numAnswers} answered`, 'https://i.imgur.com/dhA5PXS.png');

    return questionEmbed;
}

function createButtons (style, label, id, isDisabled) {
    let answerButton;

    if (isDisabled == false) {
        answerButton = new disbut.MessageButton()
        .setStyle(style)
        .setLabel(label)
        .setID(id)
    } else {
        answerButton = new disbut.MessageButton()
        .setStyle(style)
        .setLabel(label)
        .setID(id)
        .setDisabled ();
    }

    return answerButton;
}

function roleReset () {
    for (j = numContestants - 1; j > -1; j --) {
        removeRole ();
    }
}

function removeRole () {
    let role = contestantsArray [j].user.member.guild.roles.cache.find(r => r.name === "Trivia Contestant");

    contestantsArray [j].user.member.roles.remove (role).catch(console.error);

    contestantsArray.splice (j, 1);
    numContestants --;
}

function printWinners (msg) {
    let mention = (`<@${contestantsArray [0].user.user.id}>`); // This line gets angry but works just fine. Investigate further

    for (j = 1; j < numContestants; j ++) {
        let concatString = (`\n<@${contestantsArray [j].user.user.id}>`);
        mention = mention.concat (concatString);
    }

    const winnerEmbed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setAuthor('Trivia Contest', 'https://i.imgur.com/dhA5PXS.png')
    .setTitle ('The game is over!')
    .addField ('Trivia Champion(s):', mention)
    .setTimestamp()

    msg.channel.send (winnerEmbed);
}

function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

client.login(config.discord.token);

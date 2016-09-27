var express = require('express');
var fs = require('fs');
var path = require('path');
var app = express();


let group = '';
if (process.argv.length < 3) {
    console.log('\n\nYou need to provide 3 arguments: node app <text-file-name>\neg: $node app history.txt\n\n');
    process.exit()
}
process.argv.forEach(function(val, index, array) {
    if (index == 2) {
        group = val;
        parseChatFile();
    }
});



let output = '';
let previousUser = null;
const stats = {
    totalGroupMessages: 0,
    totalGroupWords: 0,
    users: {}
};



function parseChatFile() {
    let lineReader = require('readline').createInterface({
        input: require('fs').createReadStream(group + '.txt')
    });

    lineReader.on('line', function(line) {
        //if the line does not have a time stamp- it indicates its the continuation of previous user message.
        if (previousUser && line.length > 0 && !line.match(/[0-9]:[0-9][0-9] [AP]M/)) {
            let words = line.split(' ').filter(getBigWords).length;
            stats.users[previousUser].wordCount += words;
            stats.totalGroupMessages += 1;
            stats.totalGroupWords += words;
            return;
        }
        let arr = line.match(/\b[AP]M\W+(?:-\W+)?([^:]+):/);
        if (arr) {
            let name = arr[1];
            previousUser = name;
            let message = line.match(/: .*/)[0].substring(2);
            let words = message.split(' ').filter(getBigWords).length;
            let users = stats.users;
            if (users[name]) {
                users[name].messageCount += 1;
                users[name].wordCount += words;
            } else {
                users[name] = {};
                users[name].messageStart = stats.totalGroupMessages;
                users[name].wordStart = stats.totalGroupWords;
                users[name].messageCount = 1;
                users[name].wordCount = words;
                users[name].mediaCount = 0;
                let milliseconds = Math.abs(new Date(line.match(/[A-Za-z0-9_].+[AP]M./)[0].trim()) - new Date());
                let days = (milliseconds / (1000 * 60 * 60 * 24));
                users[name].days = Math.round(days);
            }
            if (message.match('<Media omitted>')) {
                users[name].mediaCount++;
            }
            stats.totalGroupMessages += 1;
            stats.totalGroupWords += words;
        }

    });

    lineReader.on('close', function() {
        printLongReport();
        fs.writeFileSync(group + '-long-report.txt', output);
        console.log("\n\nSuccess!\n\nCheck your current directory for a file named: " + group + '-long-report.txt\n\n');
        console.log(stats);
        process.exit();
    });

}

function getBigWords(word) {
    return word.length > 1;
}

function printLongReport() {
    let users = stats.users;
    output += ('\n*----- Group -----*\n');
    output += ('Total messages: ' + stats.totalGroupMessages + '\n');
    output += ('Total words: ' + stats.totalGroupWords + '\n');
    for (person in users) {

        let totalGroupMessages = stats['totalGroupMessages'];
        let totalGroupWords = stats['totalGroupWords'];
        let messagesSinceJoin = totalGroupMessages - users[person].messageStart;
        let wordsSinceJoin = totalGroupWords - users[person].wordStart;
        let userMessageCount = users[person].messageCount;
        let userMediaCount = users[person].mediaCount;
        let userWordCount = users[person].wordCount;
        let userActiveDays = users[person].days;

        output += ('\n-----' + person + '-----\n');
        output += ("Total active days: " + userActiveDays + "\n");
        output += ("Total messages: " + userMessageCount + "\n");
        output += ("Overall message contribution: " + (userMessageCount / totalGroupMessages * 100).toFixed(2) + "% \n");
        output += ("Message contribution since joining: " + (userMessageCount / messagesSinceJoin * 100).toFixed(2) + "%\n");
        output += ("Message Rate: " + Math.round(userMessageCount / userActiveDays) + " messages per day\n");
        output += ("Total words: " + userWordCount + "\n");
        output += ("Overall word contribution: " + (userWordCount / totalGroupWords * 100).toFixed(2) + "%\n");
        output += ("Word contribution since joining: " + (userWordCount / wordsSinceJoin * 100).toFixed(2) + "% \n");
        output += ("Word Rate: " + Math.round(userWordCount / userActiveDays) + " words per day\n");
        output += ("Total media posts: " + userMediaCount + "\n");
        output += ("Percentage of media posts: " + (userMediaCount / userMessageCount * 100).toFixed(2) + "%\n\n");
    }
}

app.listen(3000);

//console.log('Express app running on port 3000');

module.exports = app;










//
// function printShortReport() {
//     let users = stats.users;
//     for (person in users) {
//
//         let totalGroupMessages = stats['totalGroupMessages'];
//         let totalGroupWords = stats['totalGroupWords'];
//         let messagesSinceJoin = totalGroupMessages - users[person].messageStart;
//         let wordsSinceJoin = totalGroupWords - users[person].wordStart;
//         let userMessageCount = users[person].messageCount;
//         let userMediaCount = users[person].mediaCount;
//         let userWordCount = users[person].wordCount;
//         let userActiveDays = users[person].days;
//
//         output += ('\n  ' + person + '      ');
//         output += (" [" + (userMessageCount / totalGroupMessages * 100).toFixed(2) + "%  ");
//         output += (" | " + (userMessageCount / messagesSinceJoin * 100).toFixed(2) + "%  ");
//         output += (" | " + Math.round(userMessageCount / userActiveDays) + " messages per day] ");
//         output += ('     ');
//         output += (" [" + (userWordCount / totalGroupWords * 100).toFixed(2) + "%  ");
//         output += (" | " + (userWordCount / wordsSinceJoin * 100).toFixed(2) + "%  ");
//         output += (" | " + Math.round(userWordCount / userActiveDays) + " words per day] ");
//         output += ('     ');
//         output += (" [" + (userMediaCount / userMessageCount * 100).toFixed(2) + "% media]");
//     }
// }
//

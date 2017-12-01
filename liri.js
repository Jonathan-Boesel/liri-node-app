var request = require("request");
var inquirer = require("inquirer");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var fs = require("fs");
var Keys = require("./keys.js")

var client = new Twitter(
	Keys.twitterKeys
);

var spotify = new Spotify(
	Keys.spotifyKeys
);

function doWhatItSays() {
	fs.readFile("random.txt", "utf8", function(error, data) {

		if (error) {
			return console.log(error);
		}
		var dataArr = data.split(",");
		showSpotify(dataArr[1])
	})
}

function showTweets() {
	var params = { screen_name: 'MyClassTime', count: 20 };
	client.get('statuses/user_timeline', params, function(error, tweets, response) {

		fs.appendFile("log.txt", "\n****** Showing Tweets ******")
		if (!error) {
			for (var i = 0; i < tweets.length; i++) {
				var tweetOutput = "On " + tweets[i].created_at + " @MyClassTime said: " + tweets[i].text
				console.log(tweetOutput);
				fs.appendFile("log.txt", "\n" + tweetOutput)
			}
		}
		else {
			console.log("something is wrong")
		}
		fs.appendFile("log.txt", "\n")
	})
}

function showSpotify(userSongChoice) {
	if (userSongChoice === "") {
		userSongChoice = '"The Sign"'
	}
	else {
		userSongChoice = '"' + userSongChoice + '"';
	}

	spotify.search({ type: 'track', query: userSongChoice }, function(err, data) {
		if (err) {
			return console.log('Error occurred: ' + err);
		}
		// console.log(data)
		var spotifyOutput = [
			"Artist name: " + JSON.stringify(data.tracks.items[0].artists[0].name),
			"Song name: " + JSON.stringify(data.tracks.items[0].name),
			"Song name: " + JSON.stringify(data.tracks.items[0].name),
			"A preview can be found here: " + JSON.stringify(data.tracks.items[0].external_urls.spotify)
		]
		console.log(spotifyOutput.join("\n"))
		fs.appendFile("log.txt", "\n****** Spotify search for: " + userSongChoice + " ******\n" + spotifyOutput.join("\n") + "\n ", function(err) {
			if (err) {
				console.log(err);
			}
		});
	});
}


function showOMDB(movieName) {
	if (movieName === "") {
		movieName = "Mr. Nobody"
	}

	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

	request(queryUrl, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			var OMDBOutput = [
				"Title: " + JSON.parse(body).Title,
				"Release Year: " + JSON.parse(body).Year,
				"IMDB rating: " + JSON.parse(body).Ratings[0].Value,
				"Rotten Tomatoes rating: " + JSON.parse(body).Ratings[1].Value,
				"Country: " + JSON.parse(body).Country,
				"Language: " + JSON.parse(body).Language,
				"Plot: " + JSON.parse(body).Plot,
				"Actors: " + JSON.parse(body).Actors
			]
			console.log(OMDBOutput.join("\n"))

			//Logging
			fs.appendFile("log.txt", "\n****** OMDB search for: " + movieName + " ******\n" + OMDBOutput.join("\n") + "\n ", function(err) {
				if (err) {
					console.log(err);
				}
			});
		}
	});
}


inquirer.prompt([{
	type: "list",
	name: "userInput",
	message: "What would you like to see?",
	choices: ["Tweets", "Spotify", "OMDB", "Do what it says"]
}]).then(function(user) {
	if (user.userInput === "Tweets") {
		showTweets()
	}
	else if (user.userInput === "Spotify") {
		inquirer.prompt([{
			type: "input",
			name: "userInput",
			message: "Which song?"
		}]).then(function(user) {
			var userSongChoice = user.userInput;
			showSpotify(userSongChoice)
		})
	}
	else if (user.userInput === "OMDB") {
		inquirer.prompt([{
			type: "input",
			name: "userInput",
			message: "Which movie?"
		}]).then(function(user) {
			var movieName = encodeURI(user.userInput);
			showOMDB(movieName)
		})
	}
	else if (user.userInput === "Do what it says") {
		doWhatItSays()
	}
});

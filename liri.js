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
		if (!error) {
			for (var i = 0; i < tweets.length; i++) {
				console.log("On " + tweets[i].created_at + " @MyClassTime said: " + tweets[i].text)
			}
		}
		else {
			console.log("something is wrong")
		}
	});
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
		console.log("Artist name: " + JSON.stringify(data.tracks.items[0].artists[0].name));
		console.log("Song name: " + JSON.stringify(data.tracks.items[0].name))
		console.log("Album name: " + JSON.stringify(data.tracks.items[0].album.name))
		console.log("A preview can be found here: " + JSON.stringify(data.tracks.items[0].external_urls.spotify))
	});
}


function showOMDB(movieName) {
	if (movieName === "") {
		movieName = "Mr. Nobody"
	}

	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy";

	request(queryUrl, function(error, response, body) {
		if (!error && response.statusCode === 200) {
			console.log("Title: " + JSON.parse(body).Title);
			console.log("Release Year: " + JSON.parse(body).Year);
			console.log("IMDB rating: " + JSON.parse(body).Ratings[0].Value);
			console.log("Rotten Tomatoes rating: " + JSON.parse(body).Ratings[1].Value);
			console.log("Country: " + JSON.parse(body).Country);
			console.log("Language: " + JSON.parse(body).Language);
			console.log("Plot: " + JSON.parse(body).Plot);
			console.log("Actors: " + JSON.parse(body).Actors);
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

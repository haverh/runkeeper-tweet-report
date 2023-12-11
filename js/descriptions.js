function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	/*
	Filter to just the written tweets
	*/
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	written_tweets = tweet_array.filter((twt) => {
		return twt.written === true;
	})

	return written_tweets;
}

function addEventHandlerForSearch() {
	/*
	Search the written tweets as text is entered into the search box, and add them to the table
	*/
	$("#searchCount").text(0);
	$("#searchText").text("");
	$("#textFilter").on("input", () => {
		if ($("#textFilter").val().length > 0) {
			let filteredTweets = written_tweets.filter((obj) => {
				return obj.writtenText.includes($("#textFilter").val()) ||
						obj.writtenText.includes($("#textFilter").val().toUpperCase()) ||
						obj.writtenText.includes($("#textFilter").val().toLowerCase()) ||
						obj.writtenText.includes($("#textFilter").val().charAt(0).toUpperCase() +
										$("#textFilter").val().slice(1));
			});
			$("#searchCount").text(filteredTweets.length);
			$("#searchText").text($("#textFilter").val());
			$("#tweetTable td").remove();
			let rowHTML = "";
			filteredTweets.forEach((obj, index) => {
				rowHTML += obj.getHTMLTableRow(index+1);
			})
			$("#tweetTable").append(rowHTML);
		} else {
			$("#searchCount").text(0);
			$("#searchText").text("");
			$("#tweetTable td").remove();
		}
		
	})
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});
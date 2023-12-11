function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	$('#numberTweets').text(tweet_array.length);

	/*
	Get the first and last date of tweet
	*/
	const tweet_date_array = tweet_array.map((obj) => new Date(obj.time));
	const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
	let firstDate = new Date(Math.min.apply(null, tweet_date_array)).toLocaleDateString(undefined, options);
	let lastDate = new Date(Math.max.apply(null, tweet_date_array)).toLocaleDateString(undefined, options);
	$('#firstDate').text(firstDate);
	$('#lastDate').text(lastDate);

	/*
	Get the amount in number and percentage of completed tweets
	*/
	let completed_tweets = tweet_array.filter((obj) => obj.source === 'completed_event').length;
	let completed_percentage = math.format(((completed_tweets/tweet_array.length) * 100), {notation: 'fixed', precision: 2});
	$('.completedEvents').text(completed_tweets);
	$('.completedEventsPct').text(`${completed_percentage}%`);
	
	/*
	Get the amount in number and percentage of live event tweets
	*/
	let live_tweets = tweet_array.filter((obj) =>  obj.source === 'live_event').length;
	let live_percentage = math.format(((live_tweets/tweet_array.length) * 100), {notation: 'fixed', precision: 2});
	$('.liveEvents').text(live_tweets);
	$('.liveEventsPct').text(`${live_percentage}%`);

	/*
	Get the amount in number and percentage of achievment event tweets
	*/
	let achievement_tweets = tweet_array.filter((obj) =>  obj.source === 'achievement').length;
	let achievement_percentage = math.format(((achievement_tweets/tweet_array.length) * 100), {notation: 'fixed', precision: 2});
	$('.achievements').text(achievement_tweets);
	$('.achievementsPct').text(`${achievement_percentage}%`);

	/*
	Get the amount in number and percentage of miscellaneous event tweets
	*/
	let misc_tweets = tweet_array.filter((obj) =>  obj.source === 'miscellaneous').length;
	let misc_percentage = math.format(((misc_tweets/tweet_array.length) * 100), {notation: 'fixed', precision: 2});
	$('.miscellaneous').text(misc_tweets);
	$('.miscellaneousPct').text(`${misc_percentage}%`);

	/*
	Get the amount in number and percentage of tweets with user-written text
	*/
	let user_text = tweet_array.filter((obj) => obj.written === true).length;
	let user_percentage = math.format(((user_text/tweet_array.length) * 100), {notation: 'fixed', precision: 2});
	$('.written').text(user_text);
	$('.writtenPct').text(`${user_percentage}%`);

	const regex = /https?:\/\/[a-zA-Z0-9]+.[a-zA-Z0-9]+\/?[a-zA-Z0-9]+/
	let temp = tweet_array.filter((obj) => {
		return obj.written === true;
	})
	.map((obj) => {
		return obj.text.split(" - ")[1];
	})
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
})
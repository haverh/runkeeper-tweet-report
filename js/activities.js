function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	/*
	Create an array of all activity type objects with
		"Activity Type", "Number of Tweets", "Total Distance", and "Average Distance"
	*/
	let activitiesFreqMap = new Object();
	tweet_array.forEach((obj) => {
		activitiesFreqMap[obj.activityType] = activitiesFreqMap.hasOwnProperty(obj.activityType) 
												? activitiesFreqMap[obj.activityType] + 1 
												: 1;
	})
	let activitiesDistMap = new Object();
	tweet_array.forEach((obj) => {
		activitiesDistMap[obj.activityType] = activitiesDistMap.hasOwnProperty(obj.activityType) 
												? activitiesDistMap[obj.activityType] + obj.distance 
												: obj.distance;
	})

	let activityArray = [];
	for ( let actType in activitiesFreqMap ) {
		activityArray.push({
			"Activity Type":actType,
			"Number of Tweets": activitiesFreqMap[actType],
			"Total Distance": activitiesDistMap[actType],
			"Average Distance": activitiesDistMap[actType]/activitiesFreqMap[actType]
		})
	}

	activityArray.sort((a, b) => b["Number of Tweets"] - a["Number of Tweets"])

	$('#numberActivities').text(activityArray.length);
	$('#firstMost').text(activityArray[0]["Activity Type"]);
	$('#secondMost').text(activityArray[1]["Activity Type"]);
	$('#thirdMost').text(activityArray[2]["Activity Type"]);

	/*
	Create array of top 3 activities by average distance
	*/
	let top3 = activityArray.slice(0,3)
	top3.sort((a, b) => b["Average Distance"] - a["Average Distance"])
	$('#longestActivityType').text(top3[0]["Activity Type"]);
	$('#shortestActivityType').text(top3[2]["Activity Type"]);

	/*
	Iterate through valid activities to find longest average 
	distance between "Weekday" and "Weekend"
	*/
	let validActivities = tweet_array.filter((obj) => {
		return obj.activityType !== "unknown" || obj.activityType !== "undefined"
	});

	let weekendArray = [0,0];
	let weekdayArray = [0,0];
	validActivities.forEach((obj) => {
		if (new Date(obj.time).getDay() === 0 || new Date(obj.time).getDay() === 6) {
			weekendArray[0] += 1;
			weekendArray[1] += obj.distance;
		} else {
			weekdayArray[0] += 1;
			weekdayArray[1] += obj.distance;
		}
	});

	if ( weekdayArray[1]/weekdayArray[0] >= weekendArray[1]/weekendArray[0] ) {
		$("#weekdayOrWeekendLonger").text("weekdays")
	} else {
		$("#weekdayOrWeekendLonger").text("weekends")
	}

	/*
	Create array of tweets with type, distance, and day info
	*/
	let top3Valid = validActivities.filter((obj) => {
		return obj.activityType === top3[0]["Activity Type"] ||
				obj.activityType === top3[1]["Activity Type"] ||
				obj.activityType === top3[2]["Activity Type"];
	})

	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
	let top = top3Valid.map((obj) => {
		return {
			"Activity Type": obj.activityType,
			"Time (Num)": new Date(obj.time).getDay(),
			"Time (Day)": days[new Date(obj.time).getDay()],
			"Distance": obj.distance
		}
	});

	/*
	Create array of objects for each type/day pair with
		"Activity Type", "Time (Day)", and "Mean of Distance"
	*/
	let topMeanDays = [];
	days.forEach((day, ind) => {
		topMeanDays[ind] = top.filter((obj) => {
			return obj["Time (Day)"] === day;
		})
	})

	let topMean = [];
	topMeanDays.forEach((dayArray, ind) => {
		let firstAct = dayArray.filter((obj) => {
			return obj["Activity Type"] === top3[0]["Activity Type"];
		})

		let secondAct = dayArray.filter((obj) => {
			return obj["Activity Type"] === top3[1]["Activity Type"];
		})

		let thirdAct = dayArray.filter((obj) => {
			return obj["Activity Type"] === top3[2]["Activity Type"];
		})

		topMean.push({
			"Activity Type": top3[0]["Activity Type"],
			"Time (Day)": days[ind],
			"Mean of Distance": parseFloat(math.format((firstAct.reduce((acc, curr) => {
				return acc + curr["Distance"];
			}, 0) / firstAct.length), {notation: 'fixed', precision: 2}))
		})

		topMean.push({
			"Activity Type": top3[1]["Activity Type"],
			"Time (Day)": days[ind],
			"Mean of Distance": parseFloat(math.format((secondAct.reduce((acc, curr) => {
				return acc + curr["Distance"];
			}, 0) / secondAct.length), {notation: 'fixed', precision: 2}))
		})

		topMean.push({
			"Activity Type": top3[2]["Activity Type"],
			"Time (Day)": days[ind],
			"Mean of Distance": parseFloat(math.format((thirdAct.reduce((acc, curr) => {
				return acc + curr["Distance"];
			}, 0) / thirdAct.length), {notation: 'fixed', precision: 2}))
		})
	})


	/*
	Create each graph specification
	*/
	activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityArray,

	  },
	  "mark": "point",
	  "encoding": {
		"x": {"field": "Activity Type", "type": "ordinal"},
		"y": {"field": "Number of Tweets", "type": "quantitative"},
		"color": {"field": "Activity Type", "type": "nominal"}
	  }
	};

	distance_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "A graph of the number of Tweets containing each type of activity.",
		"width": 250,
  		"height": 250,
		"data": {
			"name": "data",
		  	"values": top,
  
		},
		"mark": "point",
		"encoding": {
		  "x": {"field": "Time (Day)", "type": "ordinal", "sort": days},
		  "y": {"field": "Distance", "type": "quantitative"},
		  "color": {"field": "Activity Type", "type": "nominal"}
		}
	};

	meanDistance_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "A graph of the number of Tweets containing each type of activity.",
		"width": 250,
  		"height": 250,
		"data": {
			"name": "data",
		  	"values": topMean,
  
		},
		"mark": "point",
		"encoding": {
		  "x": {"field": "Time (Day)", "type": "ordinal", "sort": days},
		  "y": {"field": "Mean of Distance", "type": "quantitative"},
		  "color": {"field": "Activity Type", "type": "nominal"}
		}
	};

	/*
	Render each vega lite visual
	Hide aggregated graph
	*/
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});
	vegaEmbed('#distanceVis', distance_spec, {actions:false});
	vegaEmbed('#distanceVisAggregated', meanDistance_spec, {actions:false});
	$("#distanceVisAggregated").hide();

	/*
	Add functionality to aggregate button
	*/
	$("#aggregate").on("click", function (){
		if ( $("#aggregate").text() === "Show means" ) {
			$("#distanceVis").hide();
			$("#distanceVisAggregated").show();
			$("#aggregate").text("Show all activities");
		} else {
			$("#distanceVisAggregated").hide();
			$("#distanceVis").show();
			$("#aggregate").text("Show means");
		}
	})
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
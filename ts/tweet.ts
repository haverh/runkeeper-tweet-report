class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	// returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        let compReg = /(Just )?([c|C]ompleted|posted)/;
        /*
        Identify whether the source is a live event, an achievement,
        a completed event, or miscellaneous.
        */
        if (compReg.test(this.text)) {
            return 'completed_event'
        } else if (this.text.includes("right now")){
            return 'live_event'
        } else if (this.text.includes("Achieved") || this.text.includes("achieved") || this.text.includes("set")) {
            return 'achievement'
        }
        return "miscellaneous";
    }

    // returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        /*
        Identify if tweet has user-written text
        */
        if ( this.text.includes(' - ') ) {
            return true;
        }
        return false;
    }

    // returns a string, empty or written text
    get writtenText():string {
        if(!this.written) {
            return "";
        }
        /*
        Split at "-" and get written text
        */
        const regex = /https?:\/\/[a-zA-Z0-9]+.[a-zA-Z0-9]+\/?[a-zA-Z0-9]+/
        return this.text.split(' - ')[1].split(regex)[0];
    }

    // returns a string, "unknown", "undefined", or its activity type
    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        
        /*
        Split at "km/mi" regex and get activity
        */
        let splitText:string[] = this.text.split(/\s*(km|mi)+\s*/);
        const types = new Set<string>([
            'run', 'walk', 'bike', 'elliptical', 'hike', 'swim', 'row',
            'skate', 'ski', 'snowboard', 'circuit'
        ]);
        if ( splitText.length === 1 ) {
            return "unknown";
        } else {
            let afterDistance:string[] = splitText[2].split(' ');
            if ( afterDistance[0] === "mtn" ) {
                return "bike";
            } else if ( afterDistance[0] === "MySports" ) {
                return "freestyle";
            } else if ( afterDistance[0] === "nordic" ) {
                return "walk";
            } else if ( afterDistance[0] === "chair") {
                return "chair ride";
            } else if ( types.has(afterDistance[0]) ) {
                return afterDistance[0];
            } else {
                return "undefined";
            }
        }
    }

    // returns its distance as a number
    get distance():number {
        const mi_to_km = 1.609;
        if(this.source != 'completed_event') {
            return 0;
        }
        /*
        Split at "km/mi" regex and convert km to mi is necessary
        */
        let splitText:string[] = this.text.split(/\s(km|mi)+\s/);
        if ( splitText.length > 1 ) {
            let subArray = splitText[0].split(" ");
            if ( splitText[1] == "km" ) {
                let mi = parseFloat((parseFloat(subArray[subArray.length - 1]) / mi_to_km) .toFixed(2));
                return mi;
            } else {
                return parseFloat(subArray[subArray.length - 1]);
            }
        }
        return 0;
    }

    // returns a table row in html with clickable link
    getHTMLTableRow(rowNumber:number):string {
        /*
        Split text at link regex match and embed link
        */
        let splitText = this.text.split(" ");
        const regex = /https?:\/\/[a-zA-Z0-9]+.[a-zA-Z0-9]+\/?[a-zA-Z0-9]+/

        let modifiedSplit = splitText.map((str) => {
            if (regex.test(str)) {
               return `<a href='${str}'>${str}</a>`;
            }
            return str;
        })

        return `<tr>
                    <td>${rowNumber}</td>
                    <td>${this.activityType}</td>
                    <td>${modifiedSplit.join(' ')}</td>
                </tr>`;
    }
}
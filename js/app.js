
var config = {
    apiKey: "AIzaSyDVyz-lFkcbJ5W8eX3YHhfOlcJemBdv9U0",
    authDomain: "train-schedule-8a7b5.firebaseapp.com",
    databaseURL: "https://train-schedule-8a7b5.firebaseio.com",
    projectId: "train-schedule-8a7b5",
    storageBucket: "",
    messagingSenderId: "887555504105"
};
firebase.initializeApp(config);

var database = firebase.database();
var trainFirstArrival;
var trainFrequency;
var trainNextArrival;
var trainNextMinutes;
var dateTimeFormat = "YYYY-MM-DD HH:mm";
var intervalId;
var currentMinutes;


function calcArrival() {
    var currentTime = moment().format(dateTimeFormat);
    var initialTime = moment(trainFirstArrival, dateTimeFormat);
    // Get time in minutes since first train departed
    var elapsedTime = parseInt(moment(currentTime).diff(initialTime, "minutes"));
    if (elapsedTime < 0) {
        // First train comes in the future
        // elapsed = initial - current = abs(current - initial)
        trainNextMinutes = Math.abs(elapsedTime);
        trainNextArrival = moment(initialTime).format("hh:mm a");
    }
    else {
        // Mod for remainder until next interval time
        trainNextMinutes = trainFrequency - (elapsedTime % trainFrequency);
        // Add minutes remaining to current time, convert to time of day
        trainNextArrival = moment(currentTime).add(trainNextMinutes, "minutes").format("hh:mm a");
    }
}


function checkMinutes() {
    var time = new Date();
    var minutes = time.getMinutes();
    if (minutes !== currentMinutes) { //another minute has passed
        currentMinutes = minutes;
        //call the update function
        database.ref().on("value", function(snapshot) {
            snapshot.forEach(function(childSnapshot) {

                trainFirstArrival = childSnapshot.val().trainFirstArrival;
                trainFrequency = parseInt(childSnapshot.val().trainFrequency);
                // recalculate
                calcArrival();
                // Update the ids for that key
                $("#time" + childSnapshot.key).text(trainNextArrival);
                $("#mins" + childSnapshot.key).text(trainNextMinutes);
            });
        });
    }
}


$(document.body).ready(function(){

    intervalId = setInterval(checkMinutes, 1000);

    $("#submit-train").on("click", function(event) {

        event.preventDefault();

        var trainName = $("#train-name").val().trim();
        var trainDestination = $("#train-destination").val().trim();
        trainFirstArrival = moment().format("YYYY-MM-DD") + " " + $("#train-first-arrival").val().trim();
        trainFrequency = $("#train-frequency").val().trim();

        if ((trainName === "") || (trainDestination === "")) {
            return;
        }

        database.ref().push({
            trainName: trainName,
            trainDestination: trainDestination,
            trainFirstArrival: trainFirstArrival,
            trainFrequency: trainFrequency
        });

        $("#train-name").val("");
        $("#train-destination").val("");
        $("#train-first-arrival").val("");
        $("#train-frequency").val("");

    });


    database.ref().on("child_added", function(snapshot) {

        var trainName = snapshot.val().trainName;
        var trainDestination = snapshot.val().trainDestination;
        trainFirstArrival = snapshot.val().trainFirstArrival;
        trainFrequency = parseInt(snapshot.val().trainFrequency);

        calcArrival();

        var addTr = $("<tr>");
        addTr.append("<td>" + trainName.toUpperCase() + "</td>");
        addTr.append("<td>" + trainDestination.toUpperCase() + "</td>");
        addTr.append("<td>" + trainFrequency + "</td>");
        addTr.append("<td id='time" + snapshot.key + "'>" + trainNextArrival + "</td>");
        addTr.append("<td id='mins" + snapshot.key + "'>" + trainNextMinutes + "</td>");

        $("#train-table").append(addTr);

    });

});



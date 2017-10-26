
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

var trainName;
var trainDestination;
var trainFirstArrival;
var trainFrequency;
var trainNextArrival;
var trainNextMinutes;
var dateTimeFormat = "YYYY-MM-DD HH:mm";


$(document.body).ready(function(){


    $("#submit-train").on("click", function(event) {

        event.preventDefault();

        trainName = $("#train-name").val().trim();
        trainDestination = $("#train-destination").val().trim();
        trainFirstArrival = moment().format("YYYY-MM-DD") + " " + $("#train-first-arrival").val().trim();
        trainFrequency = $("#train-frequency").val().trim();

        database.ref().push({
            trainName: trainName,
            trainDestination: trainDestination,
            trainFirstArrival: trainFirstArrival,
            trainFrequency: trainFrequency
        });
    });


    database.ref().on("child_added", function(snapshot) {

        trainName = snapshot.val().trainName;
        trainDestination = snapshot.val().trainDestination;
        trainFirstArrival = snapshot.val().trainFirstArrival;
        trainFrequency = parseInt(snapshot.val().trainFrequency);

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

        var addTr = $("<tr>");
        addTr.append("<td>" + trainName + "</td>");
        addTr.append("<td>" + trainDestination + "</td>");
        addTr.append("<td>" + trainFrequency + "</td>");
        addTr.append("<td>" + trainNextArrival + "</td>");
        addTr.append("<td>" + trainNextMinutes + "</td>");

        $("#train-table").append(addTr);

    });

});



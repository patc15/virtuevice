// This file contains local arrays that represent the database

// following arrays will mimic the database
// table name: habit
// columns: id, name, imgId
// WeeklyFreq is written as a string of 0's and 1's that represents Sunday-Monday
//var habitRowArray = [];
var habitList = {};

// table name: goalAchieved
// columns: habitId, weeklyFreq, dailyFreq, dailyCount, currentStreak, bestStreak
//var goalAchievedArray = [];
var progressList = {};

// table name: images
// columns: id, url
//var imageArray = [];
var imageList = {sleep_img: {url: "img/sleep.jpg"}, food_img: {url: "img/salad.jpg"}, smoke_img: {url: "img/smoke.jpg"}};

// variable that determines if user uploaded their custom icon
var uploadedImg = 0;

// dummy date that we are going to use for simplicity
var theDate = "20151109";

// debug mode
debug = 0;

// used for submit button
var contentToBeEdited = false;

// used for adding or editing a habit
var selectedImgId = false;

var firebase = 'https://virtue-vice.firebaseio.com/';


var ref = new Firebase(firebase);
var authData = ref.getAuth();
var currentUser = "";

if(debug) {
	if (authData) {
	  console.log("User " + authData.uid + " is logged in with " + authData.provider);
	} else {
	  console.log("User is logged out");
	}
}

if(authData) currentUser = authData.uid

var firebaseRootURL = firebase + currentUser;
var firebaseRootNode = new Firebase(firebaseRootURL);
var firebaseImageURL = firebaseRootURL + "/image/";
var firebaseHabitURL = firebaseRootURL + "/habit/";
var firebaseProgressURL = firebaseRootURL + "/progress/";

// notifications
var _roost = _roost || [];

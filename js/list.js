
window.onerror=function(msg, url, linenumber){
 //alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
 Rollbar.error('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
 return true;
}

var url = window.location.pathname;
if (!authData) {
	window.location.replace(url.slice(0, url.lastIndexOf('/')) + '/index.html');
}

function showEditBox(elm) {
	elm.style.height = "200px";
}

// image thumbnail preview
function readURL(input) {
   	if (input.files && input.files[0]) {
		var reader = new FileReader();
       	reader.onload = function (e) {
	       	document.getElementById('iconThumbnail').style.display = "";
	        document.getElementById('iconThumbnail').src = e.target.result;
	        selectImage_upload('customIcon');
    	}
    	reader.readAsDataURL(input.files[0]);
    }
}

/* creates a new habit and the new progress that is associated with the habit*/
// parameters: habitName, weeklyFreq, dailyFreq, imgId
// returns the id of the new habit
function insertNewHabit(habitName, wf, df, imgId) {
	for (habit in habitList) {
		if(habitName.toLowerCase()==(habitList[habit]["name"]).toLowerCase()) {return null;}
	}

	var habitNode = firebaseRootNode.child("habit");
	var habitRef = habitNode.push();	// creates a new entry with unique keyID
	var habitId = habitRef.key(); 	// retrieve the key that was generated
	// insert the habit into the database array
	habitRef.set({
		name:habitName,
		imgId:imgId
	});
	insertNewProgress(habitId, wf, df);
	
	if(debug) {
		console.log("Inserting into habitRowArray with values name: " + habitName + " id: " + habitId);
	}
	return habitId;
} /* end of insertNewHabit() */

/* inserts into progress. This is mainly used as a helper function from insertNewHabit() */
function insertNewProgress(habitId, wf, df) {
	var progressNode = firebaseRootNode.child("progress").child(habitId);
	var todaysDate = getTodaysDate();

	progressNode.set({
		lastUpdated:todaysDate,
		weeklyFreq:wf,
		dailyFreq:df,
		dailyCount:0,
		currentStreak:0,
		bestStreak:0,
		isCurrentBest:false
	});
	if(debug) {
		console.log("Inserting into goalAchievedArray with values habitId: " + habitId + " date: " + todaysDate);
	}
} /* end of insertNewProgress) */

/* creates the content of HTML dynamically */
// this function is overloaded, so i is an optional argument
// if the index is provided, it will insert into the index position.
// if the index is not provided, it will insert it to the end of the table
function insertIntoHtmlTable(habitId, i) {
	var habitObj = getHabitObj(habitId);
	var progressObj = getProgressObj(habitId);
	var habitName = habitObj.name;
	var imgId = habitObj.imgId;
	var url = getImgUrl(imgId);
	var df = progressObj.dailyFreq;
	var wf = progressObj.weeklyFreq;
	var dc = progressObj.dailyCount;
	var bStreak = progressObj.bestStreak;
	var currStreak = progressObj.currentStreak;
	var table = document.getElementById("habitTable");
	var index;
	var color;
	var percent = dc / df * 100;
	var week = [false, false, false, false, false, false, false];
	var today = new Date();
	var dayOfWeek = today.getDay();

	//determines initial progress bar color
	if(percent >= 0 && percent <= 33)
		color="rgba(242, 38, 19, 0.7)";
	else if(percent > 33 && percent <= 66)
		color="rgba(247, 202, 24, 0.8)";
	else if(percent > 66 && percent < 100)
		color="rgba(65, 131, 215, 0.8)";
	else if(percent == 100)
		color="rgba(0, 177, 106, 0.8)";

	// overloading
	if(typeof i !== "undefined") {index = i;} else {index = 0;}
	var tr = table.insertRow(index);	// inserting the new row at the top of the table
	tr.id = "default_row_" + habitId;
	
	if(debug) {
		console.log("Displaying " + habitName + " from insertIntoHtmlTable()");
	}
	td = tr.insertCell(0);
	td.className = "regularTd";
	td.innerHTML = "<div id=\"default_block_"+habitId+"\" class=\"habitBlock\">\
		<div class=\"habitText\">"+habitName+"</div>\
		<img class=\"habitIcon\" src=\""+url+"\" alt=\"urlError\">\
		<div class=\"progressContainer\">\
		<div class=\"progress-total\"><strong>"+currStreak+"</strong> days in a row! Best Record: <strong>"+bStreak+"</strong><br></div>\
		<div class=\"progressbar\"><div style=\"width:"+percent+"%; background-color:"+color+";\"></div></div>\
		<div class=\"progress-today\">Completed <strong>"+dc+"/"+df+"</strong> for today!</div>\
		</div>\
		<div class=\"habitButtons\">\
		<button id=\"upButton_"+habitId+"\" class=\"doneButton\"></button>\
		<button id=\"editButton_"+habitId+"\" class=\"editButton\"></button>\
		<button id=\"deleteButton_"+habitId+"\" class=\"deleteButton\"></button>\
		</div>\
		</div>";
	
	if(Math.floor(wf/1000000) > 0) week[0] = true;
	if(Math.floor(wf/100000%10) > 0) week[1] = true;
	if(Math.floor(wf/10000%10) > 0) week[2] = true;
	if(Math.floor(wf/1000%10) > 0) week[3] = true;
	if(Math.floor(wf/100%10) > 0) week[4] = true;
	if(Math.floor(wf/10%10) > 0) week[5] = true;
	if(Math.floor(wf%10) > 0) week[6] = true;
	
	//disable done button 
	if(!week[dayOfWeek]) {
		document.getElementById("upButton_"+habitId).className = "disabledButton"; 
		document.getElementById("default_block_"+habitId).parentNode.style.background = "rgba(0, 0, 0, 0.75)";
	}


	// hide empty habit text
	document.getElementById("emptyList").style.display="none"; 
} /* end of insertIntoHtmlTable() */

/* deletes the row from the HTML but not from the database */
// returns the rowId of the deleted row
function deleteFromHtmlTable(habitId) {
	var table = document.getElementById("habitTable");
	var rowId = "default_row_" + habitId;
	var row = document.getElementById(rowId);
	var index = row.rowIndex;
	table.deleteRow(index);

	// show empty habit list text
	if(table.rows.length == 0) { document.getElementById("emptyList").style.display="block"; }

	return index;
} /* end of deleteFromHtmlTable() */

/* deletes the habit and the progress associated with the habit from the database */
function deleteFromDatabase(habitId) {
	var habitRef = new Firebase(firebaseHabitURL + habitId);
	var progressRef = new Firebase(firebaseProgressURL + habitId);

	// only delete the image from database if it's the only habit referencing it
	// if there are multiple habits referencing the same image, keep it in the DB.
	var imgID;
	habitRef.once("value", function(snapshot) {
		var habitSnap = snapshot.val();
		imgID = habitSnap.imgId;
	});
	var imgOccurrence = 0;
	var habit;
	for (habit in habitList) {
		if (habitList[habit].imgId == imgID) {
			imgOccurrence += 1;
		}
	}
	if (imgOccurrence < 2) {
		var imageRef = new Firebase(firebaseImageURL + imgID);
		imageRef.remove();
	}

	habitRef.remove();
	progressRef.remove();

} /* end of deleteFromDatabase() */

/* inserts a new image to the image array */
// parameters: imageName, url
function insertNewImage(url) {
	var imageNode = firebaseRootNode.child("image");
	var imageRef = imageNode.push();	// creates a new entry with unique keyID
	var imageID = imageRef.key(); 	// retrieve the key that was generated
	if (selectedImgId === 1) {
		selectedImgId = "img_"+imageID;
		// insert the image into the database array
		imageRef.set({
			url:url
		});
	}
	else {
		selectedImgId = false;
	}
	if(debug) {
		console.log("Inserting into goalAchievedArray with values imageID: " + imageID + " and url: " + url);
	}
	
} /* end of insertNewImage() */

function imresize() {
	var MAX_WIDTH = 100;
	var MAX_HEIGHT = 100;
	var width = document.getElementById('iconThumbnail').width;
	var height = document.getElementById('iconThumbnail').height;
	var canvas = document.getElementById('canvas');
	 
	if (width > height) {
	  if (width > MAX_WIDTH) {
	    height *= MAX_WIDTH / width;
	    width = MAX_WIDTH;
	  }
	} else {
	  if (height > MAX_HEIGHT) {
	    width *= MAX_HEIGHT / height;
	    height = MAX_HEIGHT;
	  }
	}
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext("2d");
	ctx.drawImage(document.getElementById('iconThumbnail'), 0, 0, width, height);
	var dataurl = canvas.toDataURL("image/*");
	document.getElementById('iconThumbnail').src = dataurl;
}

/* returns the habit object of the provided habitId */
// parameter: habitId
// return value: habitObject
function getHabitObj(habitId) {
	if(typeof habitList !== "undefined")
		return habitList[habitId];
	else 
		return null;
} /* end of getHabitObj() */

function getProgressObj(habitId) {
	if(typeof progressList !== "undefined")
		return progressList[habitId];
	else 
		return null;
}

/* returns the url of the provided imgId */
// paremeters: imgId
// return value: url
function getImgUrl(imgId) {
	return imageList[imgId].url;
	if(debug) {
		console.log("Returning url for the image with imgId: " + imgId + " url: " + result.url);
	}
	return result.url;
} /* end of getImgUrl() */

/* returns the last updated date for the habit */
function getLastUpdated(habitId) {
	if(typeof progressList !== "undefined") {
		if(typeof progressList[habitId] !== "undefined") {
			return progressList[habitId].lastUpdated;
		}
		else {
			return 0;
		}
	}
	else {
		return 0;
	}
} /* end of getLastUpdated() */

/* called when the user selects an image from adding or editing a habit */
// highlights the selected image and sets the global variable: selectedImgId
function selectImage(id) {
	var button = document.getElementById(id);
	var allButtons = button.parentNode.childNodes;
	var i;
	var len = allButtons.length;
	// get rid of all the borders
	for(i = 0; i < len; i++) {
		allButtons[i].style.border = "none";
	}
	button.style.border = "solid";
	button.style.borderColor = "#48BA87";
	uploadedImg = 0;
	selectedImgId = id;
} /* end of selectImage() */

function selectImage_upload(id) {
	var button = document.getElementById(id);
	var allButtons = button.parentNode.childNodes;
	var i;
	var len = allButtons.length;
	// get rid of all the borders
	for(i = 0; i < len; i++) {
		allButtons[i].style.border = "none";
	}
	uploadedImg = 1;
	selectedImgId = 1;
	button.style.border = "solid";
	button.style.borderColor = "#48BA87";
} /* end of selectImage() */


/* returns today's date in mm/dd/yyyy format */
// the format is specifically chosen because it is easy to convert from string to date
// in this format
function getTodaysDate() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;
	var yyyy = today.getFullYear();
	if(dd<10) {
    dd='0'+dd
	} 
	if(mm<10) {
		mm='0'+mm
	} 
	today = mm+'/'+dd+'/'+yyyy;
	return today;
} /* end of getTodaysDate() */

/* takes two date strings in mm/dd/yyyy format and returns the
 * difference of those two dates in days */
function getDateDifference(dateString1, dateString2)  {
	var date1 = new Date(dateString1);
	var date2 = new Date(dateString2);
	var timeDiff = Math.abs(date1.getTime() - date2.getTime());
	var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	return diffDays;
} /* end of getDateDifference() */

/* this function runs at every page load and resets the daily count
 * and the weekly frequency if needed.
 * TODO: Need to change this algorithm */
function checkAndResetCount() {
	var lastUpdated;
	var todaysDate = new Date(getTodaysDate());
	var timeDiff;
	var habitId;
	var dc;
	var df;
	var wf;
	var currStreak;
	var bStreak;
	var isCurrBest;	
	var today = new Date();
	var dayOfWeek = today.getDay()-1;
	var week;
	
	for (habitId in progressList) {
		// determine if the user completed the goal
		dc = progressList[habitId].dailyCount;
		df = progressList[habitId].dailyFreq;
		wf = progressList[habitId].weeklyFreq;
		currStreak = progressList[habitId].currentStreak;
		bStreak = progressList[habitId].bestStreak;
		isCurrBest = progressList[habitId].isCurrentBest;

		lastUpdated = new Date(getLastUpdated(habitId));
		timeDiff = getDateDifference(todaysDate, lastUpdated)-1;
		dayOfWeek = today.getDay() - 1;		
		week = [false, false, false, false, false, false, false];
		if(Math.floor(wf/1000000) > 0) week[0] = true;
		if(Math.floor(wf/100000%10) > 0) week[1] = true;
		if(Math.floor(wf/10000%10) > 0) week[2] = true;
		if(Math.floor(wf/1000%10) > 0) week[3] = true;
		if(Math.floor(wf/100%10) > 0) week[4] = true;
		if(Math.floor(wf/10%10) > 0) week[5] = true;
		if(Math.floor(wf%10) > 0) week[6] = true;

		//find last "true" dayOfWeek and keep decrementing timeDiff
		while(!week[dayOfWeek] && timeDiff > 0){
			dayOfWeek--;
			timeDiff--;
			if(dayOfWeek<0)dayOfWeek=6;
		}
		
		//case where we missed a day
		if(timeDiff > 0) {
			dc = 0;
			currStreak = 0;
			isCurrBest = false;
		}
		
		//case where everything is still on track
		if(timeDiff == 0) {
			//only reset streaks if it was required on previous day to complete task
			if(week[dayOfWeek] && dc < df) {
				currStreak = 0;
				isCurrBest = false;
			}
			dc = 0;
		}
		
		//case where we updated today. do nothing.
		updateProgress(habitId, wf, df, dc, currStreak, bStreak, isCurrBest);
		var deletedIndex = deleteFromHtmlTable(habitId);
		insertIntoHtmlTable(habitId, deletedIndex);
	}
} /* end of checkAndResetCount() */

/* updates the progress object in the database */
function updateProgress(habitId, wf, df, dc, currStreak, bStreak, isCurrBest) {
	var progressNode = firebaseRootNode.child("progress").child(habitId);
	var todaysDate = getTodaysDate();
	progressNode.set({
		lastUpdated:todaysDate,
		weeklyFreq:wf,
		dailyFreq:df,
		dailyCount:dc,
		currentStreak:currStreak,
		bestStreak:bStreak,
		isCurrentBest:isCurrBest
	});
} /* end of updateProgress() */

/* updates the habit in the database */
function updateHabit(habitId, newName, newImgId) {
	for(habit in habitList) {
		if (newName.toLowerCase()==(habitList[habit]["name"]).toLowerCase() && habitId!=habit ) {return null;}
	}

	var habitNode = new Firebase(firebaseHabitURL + habitId);

	habitNode.set({
		imgId:newImgId,
		name:newName
	});

	return habitId;
} /* end of updateHabit() */

/* resets add/edit habit container fields */
function resetAddEditHabitContainer() {
	document.getElementById("sun").firstElementChild.checked = true;
	document.getElementById("mon").firstElementChild.checked = true;
	document.getElementById("tue").firstElementChild.checked = true;
	document.getElementById("wed").firstElementChild.checked = true;
	document.getElementById("thu").firstElementChild.checked = true;
	document.getElementById("fri").firstElementChild.checked = true;
	document.getElementById("sat").firstElementChild.checked = true;
	document.getElementById("dailyFreq").getElementsByTagName("option")[0].selected = true;
}
	
/* returns the weekly frequency of the user input in int */
function getWeeklyFreqFromInput() {
	var SUN = 1000000;
	var MON = 100000;
	var TUE = 10000;
	var WED = 1000;
	var THU = 100;
	var FRI = 10;
	var SAT = 1;
	var result = 0;
	var wfButtons = document.getElementsByClassName("ck-button");
	if(wfButtons.sun.firstElementChild.checked == true) {
		result += SUN;
	}
	if(wfButtons.mon.firstElementChild.checked == true) {
		result += MON;
	}
	if(wfButtons.tue.firstElementChild.checked == true) {
		result += TUE;
	}
	if(wfButtons.wed.firstElementChild.checked == true) {
		result += WED;
	}
	if(wfButtons.thu.firstElementChild.checked == true) {
		result += THU;
	}
	if(wfButtons.fri.firstElementChild.checked == true) {
		result += FRI;
	}
	if(wfButtons.sat.firstElementChild.checked == true) {
		result += SAT;
	}
	
	return result;
} /* end of getWeeklyFreqFromInput() */

/* used for edit page to preload the weeklyFreq */
function presetWeeklyFreq(habitId) {
	var wf = progressList[habitId].weeklyFreq;
	document.getElementById("sun").firstElementChild.checked = false;
	document.getElementById("mon").firstElementChild.checked = false;
	document.getElementById("tue").firstElementChild.checked = false;
	document.getElementById("wed").firstElementChild.checked = false;
	document.getElementById("thu").firstElementChild.checked = false;
	document.getElementById("fri").firstElementChild.checked = false;
	document.getElementById("sat").firstElementChild.checked = false;
	
	if(Math.floor(wf/1000000) > 0) {
		document.getElementById("sun").firstElementChild.checked = true;
	}
	if(Math.floor(wf/100000%10) > 0) {
		document.getElementById("mon").firstElementChild.checked = true;
	}
	if(Math.floor(wf/10000%10) > 0) {
		document.getElementById("tue").firstElementChild.checked = true;
	}
	if(Math.floor(wf/1000%10) > 0) {
		document.getElementById("wed").firstElementChild.checked = true;
	}
	if(Math.floor(wf/100%10) > 0) {
		document.getElementById("thu").firstElementChild.checked = true;
	}
	if(Math.floor(wf/10%10) > 0) {
		document.getElementById("fri").firstElementChild.checked = true;
	}
	if(Math.floor(wf%10) > 0) {
		document.getElementById("sat").firstElementChild.checked = true;
	}
	
} /* end of presetWeeklyFreq() */

window.onload = function() { 
	/* real-time database onChange listener
	 * The method below updates the local lists whenever
	 * the database is updated or changed
	 */
	firebaseRootNode.on("value", function(snap) {
		// initialize the local lists
		var rootNode = snap.val();
		if(rootNode) {
			habitList = rootNode.habit;
			progressList = rootNode.progress;
			var rootNodeimage = rootNode.image;
			for (var attrname in rootNodeimage) { imageList[attrname] = rootNodeimage[attrname]; }
		}
		
	}, function(errorObject) {
		alert("There was an error loading the database");
		Rollbar.error("There was an error loading the database");
	}); /* end of database change listener*/
	
	/* initializer: loads the HTML table on the page load */
	firebaseRootNode.once("value", function(snap) {
		var habitId;
		// hide empty habit list text
		if (typeof habitList === "undefined") { document.getElementById("emptyList").style.display="block";  }
		
		for(habitId in habitList) {
			insertIntoHtmlTable(habitId);
		}
		checkAndResetCount();
	}); /* end of initializer */
	

	// onclick listener for logging out
	document.getElementById("logoutButton").addEventListener("click", function() {
		ref.unauth();
	});

	// onclick listener for "add new habit"
	document.getElementById("addNewButton").addEventListener("click", function() {
		document.getElementById("addNewButton").style.display = "none"; //hides add button
		var popup = document.getElementById("addNewHabitContainer");
		var label = document.getElementById("formTitle");
		var table = document.getElementById("habitContainer");
		var imgID;
		var imgButtonInnerHTML = "";
		var imgDiv = document.getElementById("imageSelection");
		label.innerHTML = "Create a New Habit: <input id=\"newHabitName\" type=\"text\" maxlength=\"30\">"

		for(imgID in imageList) {
			imgButtonInnerHTML += "<button id=\"img_"+imgID+"\" type=\"button\" class=\"imageButton\" onclick=\"selectImage(id);\"><img src=\""+imageList[imgID].url+"\" alt=\"urlError\" style=\"width:100px; height:100px;\"></button>";
		}
		// insert images to html
		imgButtonInnerHTML += "</br><input type=\"file\" accept=\"image/*\"  id=\"imgInput\" onchange=\"readURL(this)\"/><br/>";
		imgButtonInnerHTML += "<button id=\"customIcon\" type=\"button\" class=\"imageButton\" onclick=\"selectImage_upload(id);\">";
		imgButtonInnerHTML += "<img id=\"iconThumbnail\" src=\"\" alt=\"urlError\" style=\"width:100px; height:100px;display:none\"></button>";
		imgButtonInnerHTML += "<canvas width=\"100\" height=\"100\" id=\"canvas\" style=\"display: none;\"></canvas>";
		imgDiv.innerHTML = imgButtonInnerHTML;
		
		resetAddEditHabitContainer();
		// HARDCODING TO SELECT SLEEP AS DEFAULT
		selectImage("img_" + "sleep_img");
		popup.style.display = "block";
		table.style.display = "none";
		popup.style.zIndex = "999";
	});

	// cancel button for the popup
	document.getElementById("closePopupButton").addEventListener("click", function() {
		var popup = document.getElementById("addNewHabitContainer");
		var table = document.getElementById("habitContainer");
		popup.style.display = "none";
		table.style.display = "block";
		document.getElementById("iconThumbnail").src = "";
		document.getElementById("imgInput").value = "";
		document.getElementById("addNewButton").style.display = "block"; //shows add button 
	});

	// submit button for the popup
	document.getElementById("submitPopupButton").addEventListener("click", function() {
		var popup = document.getElementById("addNewHabitContainer");
		var table = document.getElementById("habitContainer");
		var wf = getWeeklyFreqFromInput();
		var dfSelector = document.getElementById("dailyFreq");
		var df = parseInt(dfSelector.options[dfSelector.selectedIndex].value);
		var habitName = document.getElementById("newHabitName").value;

		if (uploadedImg === 1) {
			imresize();
			insertNewImage(document.getElementById('iconThumbnail').src);
			
			mixpanel.track("Custom Image");
		}

		// validation check
		if(habitName == "") {
			alert("Please fill in the new habit name");
			return false;
		}
		// making security checks to prevent script injection
		if(habitName.indexOf("<") > -1) {
			habitName = habitName.replace(/</g, "&lt;");
		}
		if (habitName.indexOf(">") > -1) {
			habitName = habitName.replace(/>/g, "&gt;");
		}
		if (habitName.indexOf("'") > -1) {
			habitName = habitName.replace(/'/g, "&#x27;");
		}
		if (habitName.indexOf("/") > -1) {
			habitName = habitName.replace(/\//g, "&#x2F;");
		}
		if (habitName.indexOf("\"") > -1) {
			habitName = habitName.replace(/"/g, "&quot;");
		}

		if(!selectedImgId) {
			alert("Please choose an image for your new habit");
			return false;
		}
		if(wf == 0) {
			alert("Please choose at least one day of the week to practice your habit");
			return false;
		}
		
		var habitId;
		var imgId = selectedImgId.split("img_")[1];	
		// separate add and edit
		// edit the habit
		if(contentToBeEdited) {
			if(confirm("Editing this will reset today's progress. Would you like to proceed?")) {
				habitId = contentToBeEdited;
				var habitObj = getHabitObj(habitId);
				var progObj = getProgressObj(habitId);
				var dc = progObj.dailyCount;
				var bStreak = progObj.bestStreak;
				var currStreak = progObj.currentStreak;
				var isCurrBest = progObj.isCurrentBest;
				var wf_prev = progObj.weeklyFreq;
				var df_prev = progObj.dailyFreq;
				// set the daily count to daily frequency if the new daily frequency is higher
				// than the current daily counter
				if(dc == df_prev) {
						currStreak--;
						if(isCurrBest) {
							bStreak--;
						}
				}
				
				dc = 0;
				
				var check = updateHabit(habitId, habitName, imgId);
				if(check == null) {
					alert("Habit with same name already exists! Aborting!");
					return;
				}
				updateProgress(habitId, wf, df, dc, currStreak, bStreak, isCurrBest);
				var deletedIndex = deleteFromHtmlTable(habitId);
				insertIntoHtmlTable(habitId, deletedIndex);
				mixpanel.track("Habit Edited");
			}

				contentToBeEdited = false;
		}
		// create new habit
		else {
			habitId = insertNewHabit(habitName, wf, df, imgId);
			if(habitId == null) {
				alert("Habit with same name already exists! Aborting!");
				return;
			}
			insertIntoHtmlTable(habitId);
		}

		mixpanel.track("Habit Created");


		// reset global variables
		selectedImgId = false;
		uploadedImg = 0;
		
		popup.style.display = "none";
		table.style.display = "block";
		document.getElementById("iconThumbnail").src = "";
		document.getElementById("imgInput").value = "";
		document.getElementById("addNewButton").style.display = "block"; //shows add button
	});
	
	// delete, edit, and done button listeners
	document.getElementById("habitTable").addEventListener("click", function(e) {
		var clickedElm;
		var clickedId;
		var clickedClass;
		if (debug) {
			console.log("clicked: " + e.target.nodeName);
			console.log("ID: " + e.target.id);
			console.log("ClassName: " + e.target.className);
		}
		if (e.target !== e.currentTarget) {
			clickedElm = e.target.nodeName;
			clickedId = e.target.id;
			clickedClass = e.target.className;
			if(clickedElm == "BUTTON") {
				if(debug) {
					console.log("clickedId className: "+clickedId);
				}

				// delete button
				if(clickedClass == "deleteButton") {
					// confirm deletion
					if(confirm("Are you sure you want to delete this habit?")) {
						var habitId = clickedId.split("deleteButton_")[1];
						deleteFromHtmlTable(habitId);
						deleteFromDatabase(habitId);
					}
					mixpanel.track("Habit Deleted");
				}

				// edit button
				else if(clickedClass == "editButton") {
					document.getElementById("addNewButton").style.display = "none"; //hides add button
					var habitId = clickedId.split("editButton_")[1];
					// set the global variable for the submit button
					contentToBeEdited = habitId;
					var habitObj = getHabitObj(habitId);
					var progressObj = getProgressObj(habitId);
					var habitName = habitObj.name;
					var imgId = habitObj.imgId;
					var df = progressObj.dailyFreq;
					var popup = document.getElementById("addNewHabitContainer");
					var table = document.getElementById("habitContainer");
					var label = document.getElementById("formTitle");
					var imgIdKey;
					var imgDiv = document.getElementById("imageSelection");
					var imgButtonInnerHTML = "";
					var dfSelector = document.getElementById("dailyFreq");
					label.innerHTML = "Edit the Habit: <input id=\"newHabitName\" type=\"text\" maxlength=\"30\">"
					document.getElementById("newHabitName").value = habitName;
					//var imageRef = new Firebase(firebaseImageURL + imgId);

					for(imgID in imageList) {
						imgButtonInnerHTML += "<button id=\"img_"+imgID+"\" type=\"button\" class=\"imageButton\" onclick=\"selectImage(id);\"><img src=\""+imageList[imgID].url+"\" alt=\"urlError\" style=\"width:100px; height:100px;\"></button>";
					}
					// insert images to html
					imgButtonInnerHTML += "</br><input type=\"file\" accept=\"image/*\"  id=\"imgInput\" onchange=\"readURL(this)\"/><br/>";
					imgButtonInnerHTML += "<button id=\"customIcon\" type=\"button\" class=\"imageButton\" onclick=\"selectImage_upload(id);\">";
					imgButtonInnerHTML += "<img id=\"iconThumbnail\" src=\"\" alt=\"urlError\" style=\"width:100px; height:100px;display:none\"></button>";
					imgButtonInnerHTML += "<canvas width=\"100\" height=\"100\" id=\"canvas\" style=\"display: none;\"></canvas>";

					imgDiv.innerHTML = imgButtonInnerHTML;
					selectImage("img_" + imgId);

					// preselect the frequency*/
					dfSelector.options[df-1].selected = true;
					presetWeeklyFreq(habitId);
					popup.style.display = "block";
					table.style.display = "none";
					popup.style.zIndex = "999";
				}
				
				// done button
				// TODO: KEVIN: change this block and apply your algorithm for the streak
				else if(clickedClass == "doneButton") {
					var habitId = clickedId.split("upButton_")[1];	// extract the habitId
					// check if the goal is completed for the day
					var progressObj = getProgressObj(habitId);
					var td = e.target.parentNode.parentNode;
					var df = progressObj.dailyFreq;
					var dc = progressObj.dailyCount;
					var wf = progressObj.weeklyFreq;
					var isCurrBest = progressObj.isCurrentBest;
					var currStreak = progressObj.currentStreak;
					var bStreak = progressObj.bestStreak;
					var progressTodayElement = document.getElementById("default_block_"+habitId).getElementsByClassName("progress-today")[0];
					var streakElement = document.getElementById("default_block_"+habitId).getElementsByClassName("progress-total")[0];
					var progressBarElement = document.getElementById("default_block_"+habitId).getElementsByClassName("progressbar")[0];
					var updateStreak = (dc+1 == df ? true : false);
					
					//var lastUpdated = new Date(getLastUpdated(habitId));
					//var todaysDate = getTodaysDate();
					//var timeDiff = getDateDifference(todaysDate, lastUpdated);
					// only update the goalAchieved array if the max hasn't reached
					// habitId, wf, df, dc, currStreak, bStreak
					if(dc < df) {
						dc++;
						progressTodayElement.innerHTML = "Completed <strong>"+dc+"/"+df+"</strong> for today!";
						if(updateStreak) {
							currStreak++;
							if(currStreak > bStreak) {
								bStreak = currStreak;
								isCurrBest = true;
							}
							streakElement.innerHTML = "<strong>"+currStreak+"</strong> days in a row! Best Record: <strong>"+bStreak+"</strong><br>";
						}
						updateProgress(habitId, wf, df, dc, currStreak, bStreak, isCurrBest);
					}

					mixpanel.track("Done Clicked");

					var newPercent = dc / df * 100;
					// Animation for progress bar
					if(newPercent >= 0 && newPercent <= 25)
						progressBarElement.firstChild.style.backgroundColor="rgba(242, 38, 19, 0.7)";
					else if(newPercent > 25 && newPercent <= 50)
						progressBarElement.firstChild.style.backgroundColor="rgba(247, 202, 24, 0.8)";
					else if(newPercent > 50 && newPercent <= 75)
						progressBarElement.firstChild.style.backgroundColor="rgba(65, 131, 215, 0.8)";
					else if(newPercent == 100)
						progressBarElement.firstChild.style.backgroundColor="rgba(0, 177, 106, 0.8)";
					progressBarElement.firstChild.style.width=""+newPercent+"%";
					// Animation for daily progress
					progressTodayElement.style.color="rgba(0, 177, 106, 0.8)";
					progressTodayElement.style.fontSize="20px";
					progressTodayElement.style.WebKitTransition="";
					progressTodayElement.style.MozTransition="";
					progressTodayElement.style.transition="";
					setTimeout(function() {
						progressTodayElement.style.color="#888"; progressTodayElement.style.fontSize="16px";
						progressTodayElement.style.WebKitTransition="color .25s ease-in, font-size .25s ease-in";
						progressTodayElement.style.MozTransition="color .25s ease-in, font-size .25s ease-in";
						progressTodayElement.style.transition="color .25s ease-in, font-size .25s ease-in";
					}, 
					50);
				}	
			}
		}	
	});
};

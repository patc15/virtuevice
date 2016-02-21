
window.onerror=function(msg, url, linenumber){
 //alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
 Rollbar.error('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
 return true;
}


var url = window.location.pathname;

// Create a callback which logs the current auth state
function authDataCallback(authData) {
  if (authData) {
    window.location.replace(url.slice(0, url.lastIndexOf('/')) + '/list.html');
  }
}

authDataCallback;
ref.onAuth(authDataCallback);


function authHandler(error, authData) {
	if (error) {
	    document.getElementById("errorMessage").innerHTML = error;
	} else {
	    if(debug) console.log("Authenticated successfully with payload:", authData);
	    window.location.replace(url.slice(0, url.lastIndexOf('/')) + '/list.html');
	}
}

window.onload = function() { 	
	document.getElementById("signup").addEventListener("click", function() {	
		document.getElementById('loginButton').style.display = "none";
		document.getElementById('hideWhenSignup').style.display = "none";
		document.getElementById('signupButton').style.display = "inline-block";
		document.getElementById('cancelButton').style.display = "inline-block";
		document.getElementById("successMessage").style.display = "none";
		document.getElementById("usermail").value = "";
		document.getElementById("password").value = "";
	});

	document.getElementById("reset").addEventListener("click", function() {
		document.getElementById('loginButton').style.display = "none";
		document.getElementById('hideWhenSignup').style.display = "none";
		document.getElementById('resetButton').style.display = "inline-block";
		document.getElementById('cancelButton').style.display = "inline-block";
		document.getElementById("successMessage").style.display = "none";
		document.getElementById("passwordRow").style.display = "none";
		document.getElementById("passwordRow2").style.display = "none";
	});


	document.getElementById("resetButton").addEventListener("click", function() {
		ref.resetPassword({
		  email: document.getElementById("usermail").value
		}, function(error) {
		  if (error) {
		  	document.getElementById('errorMessage').style.display = "inline-block";
		  	document.getElementById("successMessage").style.display = "none";
		    switch (error.code) {
		      case "INVALID_USER":
		        document.getElementById("errorMessage").innerHTML = 
		        	"The specified user account does not exist.";
		        break;
		      default:
		        document.getElementById("errorMessage").innerHTML = error;
		    }
		  } else {
		    document.getElementById("successMessage").innerHTML = 
		    	"Password reset email sent successfully!";
	    	document.getElementById('loginButton').style.display = "inline-block";
			document.getElementById('hideWhenSignup').style.display = "inline-block";
			document.getElementById('resetButton').style.display = "none";
			document.getElementById('cancelButton').style.display = "none";
			document.getElementById('errorMessage').style.display = "none";
			document.getElementById("successMessage").style.display = "inline-block";
			document.getElementById("passwordRow").style.display = "table-cell";
			document.getElementById("passwordRow2").style.display = "table-cell";
			document.getElementById("password").value = "";
		  }
		});
	});
	

	document.getElementById("cancelButton").addEventListener("click", function() {
		document.getElementById('loginButton').style.display = "inline-block";
		document.getElementById('hideWhenSignup').style.display = "inline-block";
		document.getElementById('signupButton').style.display = "none";
		document.getElementById('cancelButton').style.display = "none";
		document.getElementById('resetButton').style.display = "none";
		document.getElementById("successMessage").style.display = "none";
		document.getElementById("usermail").value = "";
		document.getElementById("password").value = "";
		document.getElementById("passwordRow").style.display = "inline-block";
		document.getElementById("passwordRow2").style.display = "table-cell";
	});

	document.getElementById("signupButton").addEventListener("click", function() {
		var ref = new Firebase("https://virtue-vice.firebaseio.com");
		ref.createUser({
		  email: document.getElementById("usermail").value,
		  password: document.getElementById("password").value

		}, function(error, userData) {
		  if (error) {
		  	document.getElementById('errorMessage').style.display = "inline-block";
		  	document.getElementById("successMessage").style.display = "none";
		    switch (error.code) {
		      case "EMAIL_TAKEN":
		        document.getElementById("errorMessage").innerHTML = 
		        	"Email is already in use.";
		        break;
		      case "INVALID_EMAIL":
		        document.getElementById("errorMessage").innerHTML = 
		        	"Invalid email.";
		        break;
		      default:
		        document.getElementById("errorMessage").innerHTML = error;
		    }
		  } else {
		  		document.getElementById("successMessage").innerHTML = 
		    		"Account successfully created! Please log in."
				document.getElementById('loginButton').style.display = "inline-block";
				document.getElementById('hideWhenSignup').style.display = "inline-block";
				document.getElementById('signupButton').style.display = "none";
				document.getElementById('cancelButton').style.display = "none";
				document.getElementById('errorMessage').style.display = "none";
				document.getElementById("successMessage").style.display = "inline-block";
				document.getElementById("usermail").value = "";
				document.getElementById("password").value = "";
			};
		});
	});
	
	document.getElementById("loginButton").addEventListener("click", function() {
		// Create a callback to handle the result of the authentication
		ref.authWithPassword({
			email: document.getElementById("usermail").value,
			password: document.getElementById("password").value
		}, authHandler);
	});
	
	document.getElementById("facebookButton").addEventListener("click", function() {
		ref.authWithOAuthPopup("facebook", function(error, authData) {
			if(debug) {
				if (error) {
					console.log("Login Failed!", error);
				} else {
					console.log("Authenticated successfully with payload:", authData);
				}
			}
		});
	});
	
	document.getElementById("googleButton").addEventListener("click", function() {
		ref.authWithOAuthPopup("google", function(error, authData) {
			if(debug) {
				if (error) {
					console.log("Login Failed!", error);
				} else {
					console.log("Authenticated successfully with payload:", authData);
				}
			}
		});
	});
	
	document.onkeydown = function(e) {
		var keyCode = e ? (e.which ? e.which : e.keyCode) : event.keyCode;
		if(keyCode == 13) {
			document.getElementById("loginButton").click();
		}
	}
}

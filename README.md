# CSE 134B HW5 Team Nerdz
* https://virtuevice.us/

## Group Members:
* Kevin Hsu
* Patrick Chung
* Brian Choi
* Lamar Cimafranca
* Linda Shih

## Changes from Design Template
* We removed the welcome page so that the user is directed to their habit list after login.  The welcome page 
on the template was redundant because the edit page already has a "Add Habit" button.
* We added the VIRTUE/vice logo to the the top of the habit list to remind user of the web app name. 
* We widened the habit entries to take advantage of the screen size on desktop browsers.  In addition we also
improved the mobile window resizing.
* We improved the position of the habit buttons by right-justifying them so that they are easier to see and click 
on both mobile and desktop.  We also changed the shape and size of the buttons so they are easier to click and 
are more consistent with the overall design.
* We added a "Cancel" button to the "Add Habit" and "Edit Habit" pages so that a user does not have to use the back 
button in the browser.  Team XYZ used separate HTML pages for these pages, but we decided to use popups to eliminate 
the need to use the back button.
* The logo was refined mainly to feature a icon that can be used in contexts without the name.
* For "Add Habit", all days of the week are added by default.  We did so that the user does not need to select each 
day every time they add a habit.
* If a habit is not supposed to be performed today (the user did not select the current day of the week as part of
the frequency), then it is "greyed out" and the user cannot complete the habit. The user can still edit the habit.

## Notifications
* A notification is sent everyday at 9 PM PST to all users reminding them to fill in their habits.  The user must
 subscribe to notifications to receive them.  Users have the option to enable and disable notifications and other settings
 if the paid service of Roost is used, but we are using the free trial.
* Roost was used to implement the notifications.  On-site notifications are supported on both the desktop and mobile
 versions of Chrome, Firefox, Internet Explorer, Safari (desktop and iOS), and Opera.  Off-site notifications are 
supported on Chrome (Mac OS X, Windows, Linux and Android) and on Safari (Mac OS X).
* An additional option that was explored was allowing users to schedule their own notifications.  Although we wanted
 to implement this feature for our users, it is a paid service on Roost so we are unable to do this.
* We decided that the Web Notifications API was not a viable option due to compatibility issues with the desktop
 version of Internet Explorer, and the mobile versions of Internet Explorer, Opera, and Safari.  In addition, the
 Web Notifications API was not capable of sending notifications to the user unless the user had the web application
 open or running in the background.
* Notifications do not work unless you are viewing the web app from our domain virtuevice.us therefore it has been
commented out in the offline files. 

## Database
* We are using Firebase to host our website: virtue-vice.firebaseapp.com
* We purchased a domain name to support Chrome notifications: virtuevice.us

## Miscellaneous
* If a user edits a habit such that the new daily frequency is lower than the amount of times the user filled out
 the habit on that day, the amount of times the user filled out the habit will be reset to 0 to avoid any confusion
 when editing the frequency.
* We decided to reset the daily progress such as daily count and streak for the day for each edit because we wanted
  to provide the users with the ability to reset the count in case they mistakenly click the "done" button and to prevent 
  users from cheating the streak system.
* The website may take a few seconds to load because fetching data from Firebase and Roost is slow.
* The virtuevice.us domain name was purchased for $4, and Firebase custom domain naming feature was $10.

## Login credentials
* Virtue Vice login details:
Username: nerdzvirtuevice1@gmail.com
Password: nerdzvirtuevice
* Rollbar login details:
Username: nerdzvirtuevice1@gmail.com
Password: nerdzvirtuevice1
* MixPanel login details:
Username: nerdzvirtuevice1@gmail.com
Password: nerdzvirtuevice

## Signup/Login notes
* Due to Firebase's connection and limited capabilities, Android and iOS Facebook/Google popup authentication does not work on the offline version. It works on the domain in a web browser.
* Currently, there is no way to confirm an email using Firebase to verify signups and permanently reserving emails.
* After resetting password, user cannot change their password currently. They can keep resetting the password, but implementation of password changing has not been completed.

## Error Reporting
* Rollbar was used to for error reporting and will automatically catch errors in the code and record them to the Rollbar dashboard.
* Our error reporting feature will include the error message of the error, the URL, and the line number when the error is sent to Rollbar.  This will allow us to see the exact error name on the page it occured on, as well as where in the code it occured for quick debugging.
* Rollbar also provides useful information about errors in addition to the ones listed above.  It shows the most frequently occuring errors, which is useful for prioritizing fixes.  It also logs the timestamp, runtime, IP addresses, and provides charts showing occurences by browser and occurences by OS, for each error.

## User Analytics
* User analytics using MixPanel tracks 5 different user activities: creating a habit, deleting a habit, completing a habit, editing a habit, and if a custom image is used for a habit.
* From these data points, we hope that this will give us a better insight to areas that need more attention when making app improvements. For example, if we notice that most users upload custom images, we can aim to implement a better UI for image uploading. Or, if we notice that users are not completing their habits, we can aim to implement a better notifications system to remind them to do so.
* MixPanel provides good data visualization as a chart, and if necessary allows us (the admin) to monitor when, where, which browser, and screen resolution as well. All this data (and more) is accessible from the Live View panel on the side. If needed, this allows us to see where most of our traffic is coming from and which types of users are looking at our website (large or small screens).

## Minification and Bundling
* We combined all the JavaScript files for each HTML file using Grunt task automating tool. 
* We didn't blindly combine all JS files into one file because we have two separate html files, and we did not want to slow down page loading by including JS files that won't be used by the html file. Instead, we combined all the JS files needed by index.html into one, and all the JS files needed by list.html into another one and included them separately.
* After combining all the JS files, we also got rid of comments and white spaces by using the uglify plugin from Grunt.
* In addition to minimizing the JavaScript files, we also reduced the size of our CSS files by using a different Grunt plugin called cssmin. Our CSS files were reduced by at least half of the original size.
* We included both compressed and uncompressed js files in the folder.

## Android/IOS POC
* A mostly working Android app version of the app is included as a .apk file. Some features do not work such as 
image upload, Facebook/Google login, and back button. We did not include an iOS version because we did not have access
to a Mac due to hardware issues. But POC would be similar to Android app where we used a web view to open the website
in a web client through the native application.

## Chrome Package Effort (extra credit)
* We have two Chrome versions packaged. The first version does not have functionality outside of the login page because 
Chrome apps are not allowed to load external scripts, specifically the one from Firebase. This can be resolved by using 
a different database that can be accessed using a local script.
* To install the first version, just drag VirtueVice_single.crx to chrome://extensions page.
* The second version is converted from our Android app version, but requires the installation of Archon Runtime extension. 
This can be done by following the instructions here:
https://github.com/vladikoff/chromeos-apk/blob/master/archon.md
Then, just drag VirtueVice_double.crx to chrome://extensions page.


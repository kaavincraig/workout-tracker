var MY_SECRET_KEY = "MYJEY";

function doGet(e) {
  // Check if API key matches
  var key = e && e.parameter && e.parameter.key ? e.parameter.key : null;
  if (key !== MY_SECRET_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ status: "unauthorized" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var folderName = "Workout Tracker";
    var fileName = "workout_data.json";
    var folders = DriveApp.getFoldersByName(folderName);
    var workoutData = { workout_logs: [] };
    
    if (folders.hasNext()) {
      var folder = folders.next();
      var files = folder.getFilesByName(fileName);
      if (files.hasNext()) {
        workoutData = JSON.parse(files.next().getBlob().getDataAsString());
      }
    }
    
    var outputText = JSON.stringify(workoutData);
    var callback = e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + outputText + ");")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(outputText).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error" })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var key = (e.parameter && e.parameter.key) ? e.parameter.key : null;
  if (key !== MY_SECRET_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ status: "unauthorized" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var contents = (e.parameter && e.parameter.contents) ? e.parameter.contents : (e.postData ? e.postData.contents : "");
    var data = JSON.parse(contents);
    var folderName = "Workout Tracker";
    var fileName = "workout_data.json";
    
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    var files = folder.getFilesByName(fileName);
    var file;
    if (files.hasNext()) {
      file = files.next();
      file.setContent(JSON.stringify(data, null, 2));
    } else {
      file = folder.createFile(fileName, JSON.stringify(data, null, 2), MimeType.PLAIN_TEXT);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error" })).setMimeType(ContentService.MimeType.JSON);
  }
}

var MY_SECRET_KEY = "MYJEY";
var FOLDER_NAME = "Workout Tracker";
var FILES = {
  workout: "workout_data.json",
  custom_workouts: "custom_workouts.json"
};

function resolveFileName(target) {
  return FILES[target] || FILES.workout;
}

function doGet(e) {
  // Check if API key matches
  var key = e && e.parameter && e.parameter.key ? e.parameter.key : null;
  if (key !== MY_SECRET_KEY) {
    return ContentService.createTextOutput(JSON.stringify({ status: "unauthorized" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var fileName = resolveFileName(e.parameter && e.parameter.target);
    var folders = DriveApp.getFoldersByName(FOLDER_NAME);
    var content = e.parameter.target === 'custom_workouts' ? [] : { workout_logs: [] };

    if (folders.hasNext()) {
      var folder = folders.next();
      var files = folder.getFilesByName(fileName);
      if (files.hasNext()) {
        content = JSON.parse(files.next().getBlob().getDataAsString());
      }
    }

    var outputText = JSON.stringify(content);
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
    var fileName = resolveFileName(e.parameter && e.parameter.target);

    var folders = DriveApp.getFoldersByName(FOLDER_NAME);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(FOLDER_NAME);
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

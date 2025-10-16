// Global configuration for the contact form
var SPREADSHEET_ID = "1FYyGXw89iHAsLni5noUKSJpE5tOdbKKGv4wrEVxTxoA";
var SHEET_NAME = "Sheet1";

/**
 * Main function to handle web app requests
 */
function doGet(e) {
  return HtmlService.createHtmlOutput(
    "<h1>Contact Form Service</h1><p>This service handles contact form submissions from the contact page.</p>"
  );
}

/**
 * Handle POST requests from the contact form
 */
function doPost(e) {
  try {
    // Log the incoming request for debugging
    Logger.log("Received contact form submission: " + JSON.stringify(e.parameters));
    
    // Check if this is a newsletter submission from prizes page or a contact form submission
    var isPrizesForm = e.parameters.fullname && e.parameters.email2;
    var isContactForm = e.parameters.name && e.parameters.email && e.parameters.message;
    
    if (isPrizesForm) {
      return handlePrizesFormSubmission(e);
    } else if (isContactForm) {
      return handleContactFormSubmission(e);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Invalid form submission" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    // Log the error
    Logger.log("Error processing form submission: " + error.toString());
    
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({ 
        status: "error", 
        message: "Failed to process submission: " + error.message 
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle prizes newsletter form submission
 */
function handlePrizesFormSubmission(e) {
  // Validate required fields
  var requiredFields = ["fullname", "email2"];
  for (var i = 0; i < requiredFields.length; i++) {
    var field = requiredFields[i];
    if (!e.parameters[field] || e.parameters[field][0].trim() === "") {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Missing required field: " + field })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Validate reCAPTCHA checkbox
  if (!e.parameters.recaptcha2 || e.parameters.recaptcha2[0] !== "on") {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Please verify you are not a robot" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Get the sheet to store data
  var sheet = setupSpreadsheet();
  
  // Generate a unique subscription ID
  var subscriptionId = generateSubscriptionId();
  
  // Prepare data for storage
  var timestamp = new Date();
  var rowData = [
    timestamp.toISOString(),
    sanitizeInput(e.parameters.fullname[0]),
    sanitizeInput(e.parameters.email2[0]),
    "Prizes Page",
    "Active",
    subscriptionId,
    "", // No message for newsletter
    "Newsletter"
  ];
  
  // Append the data to the sheet
  sheet.appendRow(rowData);
  
  // Log successful submission
  Logger.log("Newsletter subscription successfully stored with ID: " + subscriptionId);
  
  // Return success response
  return ContentService.createTextOutput(
    JSON.stringify({ 
      status: "success", 
      message: "Thank you for subscribing to our newsletter!",
      subscriptionId: subscriptionId
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle contact form submission
 */
function handleContactFormSubmission(e) {
  // Validate required fields
  var requiredFields = ["name", "email", "message"];
  for (var i = 0; i < requiredFields.length; i++) {
    var field = requiredFields[i];
    if (!e.parameters[field] || e.parameters[field][0].trim() === "") {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Missing required field: " + field })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Validate reCAPTCHA checkbox
  if (!e.parameters.recaptcha || e.parameters.recaptcha[0] !== "on") {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: "Please verify you are not a robot" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Get the sheet to store data
  var sheet = setupSpreadsheet();
  
  // Generate a unique submission ID
  var submissionId = generateSubmissionId();
  
  // Prepare data for storage
  var timestamp = new Date();
  var rowData = [
    timestamp.toISOString(),
    sanitizeInput(e.parameters.name[0]),
    sanitizeInput(e.parameters.email[0]),
    "Contact Page",
    "New",
    submissionId,
    sanitizeInput(e.parameters.message[0]),
    "Contact"
  ];
  
  // Append the data to the sheet
  sheet.appendRow(rowData);
  
  // Log successful submission
  Logger.log("Contact form submission successfully stored with ID: " + submissionId);
  
  // Return success response
  return ContentService.createTextOutput(
    JSON.stringify({ 
      status: "success", 
      message: "Thank you for your message! We will get back to you soon.",
      submissionId: submissionId
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Setup the spreadsheet and sheet
 */
function setupSpreadsheet() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    
    // Always ensure the sheet has the correct headers
    var headers = [
      "Timestamp",
      "FullName",
      "Email",
      "Source",
      "Status",
      "ID",
      "Message",
      "Type"
    ];
    
    // Check if headers already exist
    var existingHeaders = [];
    if (sheet.getLastRow() > 0) {
      existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }
    
    // If headers don't exist or are incorrect, set them
    if (existingHeaders.length === 0 || existingHeaders[0] !== headers[0]) {
      // Clear the first row to avoid conflicts
      sheet.getRange(1, 1, 1, sheet.getLastColumn()).clear();
      
      // Set the correct headers
      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
        .setFontWeight("bold")
        .setBackground("#4285F4")
        .setFontColor("white");
      
      // Auto-resize columns
      sheet.autoResizeColumns(1, headers.length);
      
      // Freeze the header row
      sheet.setFrozenRows(1);
      
      Logger.log("Headers have been set up in the sheet");
    }
    
    return sheet;
  } catch (error) {
    Logger.log("Error setting up spreadsheet: " + error.toString());
    throw new Error("Failed to set up spreadsheet: " + error.message);
  }
}

/**
 * Generate a unique subscription ID
 */
function generateSubscriptionId() {
  var timestamp = new Date().getTime();
  var random = Math.floor(Math.random() * 10000);
  return "SUB" + timestamp + random;
}

/**
 * Generate a unique submission ID
 */
function generateSubmissionId() {
  var timestamp = new Date().getTime();
  var random = Math.floor(Math.random() * 10000);
  return "CON" + timestamp + random;
}

/**
 * Sanitize input to prevent injection attacks
 */
function sanitizeInput(input) {
  if (!input) return "";
  
  // Remove HTML tags and special characters
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/['"\\]/g, "")
    .trim();
}

/**
 * Test function to verify the script is working
 */
function test() {
  try {
    var sheet = setupSpreadsheet();
    return "Test successful. Sheet is ready to receive form data. Using SPREADSHEET_ID: " + SPREADSHEET_ID + " and SHEET_NAME: " + SHEET_NAME;
  } catch (error) {
    return "Test failed: " + error.toString();
  }
}
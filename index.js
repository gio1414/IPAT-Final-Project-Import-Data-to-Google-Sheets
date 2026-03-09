const { google } = require("googleapis");
const path = require("path");

// 1. Setup Authentication
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "your-service-account-file.json"), // Use the exact name of your JSON key
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// 2. The Export Route
app.post("/export-tasks", async (req, res) => {
    try {
        const sheets = google.sheets({ version: "v4", auth });
        const spreadsheetId = "YOUR_SPREADSHEET_ID_HERE"; // Get this from your Google Sheet URL

        // Example: Assuming your tasks are stored in a variable called 'todoList'
        // Format: [[Column A, Column B, Column C]]
        const values = todoList.map((task) => [
            task.id,
            task.text,
            task.completed ? "Done" : "Pending",
        ]);

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: "Sheet1!A2", // Start writing from the second row
            valueInputOption: "USER_ENTERED",
            resource: { values },
        });

        res.status(200).send("Data exported successfully!");
    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).send("Failed to export data.");
    }
});

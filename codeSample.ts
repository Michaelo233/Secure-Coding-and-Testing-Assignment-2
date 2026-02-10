import * as readline from 'readline';
import * as mysql from 'mysql';
import { exec } from 'child_process';
import https from 'https';

/**
 * Database configuration
 * Credentials are stored in environment variables to prevent exposure
 */
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

/**
 * Reads user input from the command line
 */
function getUserInput(): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question("Enter your name: ", (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

/**
 * Sends an email using a system command
 * Improved error handling added
 */
function sendEmail(to: string, subject: string, body: string): void {
    exec(`echo "${body}" | mail -s "${subject}" ${to}`, (error) => {
        if (error) {
            console.error("Failed to send email:", error.message);
        }
    });
}

/**
 * Securely fetches data from an external API
 * Uses HTTPS and includes error handling
 */
function getData(): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get("https://secure-api.com/get-data", (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                resolve(data);
            });
        }).on("error", (error) => {
            console.error("Error fetching data:", error.message);
            reject(error);
        });
    });
}

/**
 * Saves data to the database securely
 * Uses parameterized queries to prevent SQL injection
 */
function saveToDb(data: string): void {
    const connection = mysql.createConnection(dbConfig);

    const query = "INSERT INTO mytable (column1, column2) VALUES (?, ?)";

    connection.connect((err) => {
        if (err) {
            console.error("Database connection failed:", err.message);
            return;
        }

        connection.query(query, [data, "Another Value"], (error) => {
            if (error) {
                console.error("Error executing query:", error.message);
            } else {
                console.log("Data saved successfully");
            }
            connection.end();
        });
    });
}

/**
 * Main execution flow
 */
(async () => {
    try {
        const userInput = await getUserInput();
        const data = await getData();
        saveToDb(data);
        sendEmail("admin@example.com", "User Input", userInput);
    } catch (error) {
        console.error("Application error:", (error as Error).message);
    }
})();
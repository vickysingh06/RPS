const sql = require("mssql");

// MS SQL Server Configuration
const dbconfig = {
    user: "your_db_username",
    password: "your_db_password",
    server: "localhost",  // Use your hostname
    database: "your_database_name",
    options: {
        encrypt: false,              // Set to true for Azure
        trustServerCertificate: true // Required for local connections
    }
};

// Connect to Database
async function connectDB() {
    try {
        let pool = await sql.connect(config);
        console.log("✅ Connected to SQL Server");
        return pool;
    } catch (err) {
        console.error("❌ Database connection failed!", err);
    }
}

// Export connection function
module.exports = { connectDB, sql };

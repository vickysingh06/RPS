require("dotenv").config();
const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const dbConfig = {
    user: "sa",
    password: "Asarfi@1234",
    server: "20.204.178.165", // Example: 'localhost', '192.168.1.100', or 'MYSERVER\\SQLEXPRESS'
    database: "Refpay",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Connect to Database
sql.connect(dbConfig)
    .then(() => console.log("Connected to MS SQL Server - refpay"))
    .catch(err => console.error("DB Connection Failed", err));

/*// Route to Insert Patient Entry and Return Patient ID
app.post("/patients", async (req, res) => {
    try {
        const { patient_name, date_of_referral, unique_id_1, referral_type, unique_id_2, unique_id_3 } = req.body;

        if (!patient_name || !date_of_referral || !unique_id_1 || !referral_type) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await sql.query(`
            INSERT INTO PatientEntry (Name, DateOfReferral, UniqueID1, ReferralType, UniqueID2, UniqueID3) 
            OUTPUT INSERTED.PatientID
            VALUES ('${patient_name}', '${date_of_referral}', '${unique_id_1}', '${referral_type}', 
            '${unique_id_2 || ''}', '${unique_id_3 || ''}')
        `);

        res.json({ patientId: result.recordset[0].PatientID, message: "Patient added successfully" });
    } catch (error) {
        console.error("Error inserting patient:", error);
        res.status(500).send(error.message);
    }
});



// for Patient Admit Confirm
/*
app.post("/patientAdmitform", async (req, res) => {
    try {
        const { patient_id, date_of_admission, admission_status } = req.body;

        if (!patient_id || !date_of_admission || !admission_status) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const pool = await sql.connect(dbConfig);

        try {
            // ✅ Step 1: Check if patient_id exists in `patient_entry` table
            const checkPatient = await pool
                .request()
                .input("PatientID", sql.Int, patient_id)
                .query("SELECT TOP 1 PatientID FROM patiententry WHERE PatientID = @PatientID");

            if (checkPatient.recordset.length === 0) {
                return res.status(404).json({ error: "Patient Entry Pending" });
            }

            try {
                // ✅ Step 1: Check if patient_id exists in `current` table
                const checkPatient = await pool
                    .request()
                    .input("PatientID", sql.Int, patient_id)
                    .query("SELECT TOP 1 PatientID FROM Patadmitconfirm WHERE PatientID = @PatientID");
    
                if (checkPatient.recordset.length === 0) {
                    return res.status(404).json({ error: "Data Already exsist" });
                }

            const result = await pool
                .request()
                .input("PatientID", sql.Int, patient_id)
                .input("DateOfAdmission", sql.Date, date_of_admission)
                .input("StatusOfAdmission", sql.NVarChar, admission_status)
                .query(`
                    INSERT INTO Patadmitconfirm (PatientID, DateOfAdmission, StatusOfAdmission) 
                    VALUES (@PatientID, @DateOfAdmission, @StatusOfAdmission)
                `);
            res.json({ success: true, message: "Patient admitted successfully" });

        } finally {
            pool.close(); // ✅ Close the connection properly
        }

    } catch (error) {
        console.error("Error inserting patient admission:", error);
        res.status(500).json({ error: "Internal Server Error Check" });
    }
});
*/
/*
// for Status of Patient
app.post("/statusOfPatient", async (req, res) => {
    try {
        const { patient_id, admitted_to, department,type_admission, type_test, bill_amount} = req.body;

        if (!patient_id|| !admitted_to|| !department||!type_admission|| !type_test|| !bill_amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const pool = await sql.connect(dbConfig);

        try {
            // ✅ Step 1: Check if patient_id exists in `patient_entry` table
            const checkPatient = await pool
                .request()
                .input("PatientID", sql.Int, patient_id)
                .query("SELECT TOP 1 PatientID FROM patiententry WHERE PatientID = @PatientID");

            if (checkPatient.recordset.length === 0) {
                return res.status(404).json({ error: "Patient Entry Pending" });
            }

          /*  try {
                // ✅ Step 1: Check if patient_id exists in `current` table
                const checkPatient = await pool
                    .request()
                    .input("PatientID", sql.Int, patient_id)
                    .query("SELECT TOP 1 PatientID FROM Patadmitconfirm WHERE PatientID = @PatientID");
    
                if (checkPatient.recordset.length === 0) {
                    return res.status(404).json({ error: "Admit Entry Pending" });
                }

            const result = await pool
                .request()
                .input("PatientID", sql.Int, patient_id)
                .input("admittedto", sql.NVarChar, admitted_to)
                .input("department", sql.NVarChar, department)
                .input("typeadmission", sql.NVarChar, type_admission)
                .input("typetest", sql.NVarChar, type_test)
                .input("billamount", sql.NVarChar, bill_amount)
                .query(`
                    INSERT INTO status (PatientID, admittedto, department, typeofadmission, typeoftest, billamount) 
                    VALUES (@PatientID, @admittedto, @department, @typeadmission, @typetest, @billamount)
                `);
            res.json({ success: true, message: "Patient Status Updated successfully" });

        } finally {
            pool.close(); // ✅ Close the connection properly
        }

    } catch (error) {
        console.error("Error inserting patient admission:", error);
        res.status(500).json({ error: "Internal Server Error Check" });
    }
});

// for Reffral Entry
app.post("/referralPayment", async (req, res) => {
    try {
        const { 
            patient_id, 
            date_of_payment, 
            payment_status_1, 
            paid_amount_1, 
            payment_type, 
            payment_status_2, 
            paid_amount_2, 
            payment_status_3, 
            paid_amount_3 
        } = req.body;

        // ✅ Check for required fields
        if (!patient_id || !date_of_payment || !payment_status_1 || !paid_amount_1 || !payment_type) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const pool = await sql.connect(dbConfig);

        try {
            // ✅ Step 1: Check if Patient Exists in `patiententry` Table
            const checkPatient = await pool
                .request()
                .input("PatientID", sql.Int, patient_id)
                .query("SELECT TOP 1 PatientID FROM patiententry WHERE PatientID = @PatientID");

            if (checkPatient.recordset.length === 0) {
                return res.status(404).json({ error: "Patient Entry Pending" });
            }

            // ✅ Step 2: Insert Data into `referral_payments` Table
            const result = await pool
                .request()
                .input("PatientID", sql.Int, patient_id)
                .input("DateOfPayment", sql.Date, date_of_payment)
                .input("PaymentStatus1", sql.NVarChar, payment_status_1)
                .input("PaidAmount1", sql.Decimal(10, 2), paid_amount_1)
                .input("PaymentType", sql.NVarChar, payment_type)
                .input("PaymentStatus2", sql.NVarChar, payment_status_2 || "N/A")
                .input("PaidAmount2", sql.Decimal(10, 2), paid_amount_2 || 0)
                .input("PaymentStatus3", sql.NVarChar, payment_status_3 || "N/A")
                .input("PaidAmount3", sql.Decimal(10, 2), paid_amount_3 || 0)
                .query(`
                    INSERT INTO referral_payments 
                    (PatientID, DateOfPayment, PaymentStatus1, PaidAmount1, PaymentType, PaymentStatus2, PaidAmount2, PaymentStatus3, PaidAmount3) 
                    VALUES (@PatientID, @DateOfPayment, @PaymentStatus1, @PaidAmount1, @PaymentType, @PaymentStatus2, @PaidAmount2, @PaymentStatus3, @PaidAmount3)
                `);

            res.json({ success: true, message: "Referral Payment Updated Successfully" });

        } finally {
            await pool.close(); // ✅ Close Connection
        }

    } catch (error) {
        console.error("Error inserting referral payment:", error);
        res.status(500).json({ error: "Internal Server Error - Check Logs" });
    }
});
*/

/**
 * 1️⃣ Insert Patient Entry and Return Patient ID
 */
app.post("/patients", async (req, res) => {
    try {
        const { patient_name, date_of_referral, unique_id_1, referral_type, unique_id_2, unique_id_3 } = req.body;

        if (!patient_name || !date_of_referral || !unique_id_1 || !referral_type) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await sql.query(`
            INSERT INTO PatientEntry (Name, DateOfReferral, UniqueID1, ReferralType, UniqueID2, UniqueID3) 
            OUTPUT INSERTED.PatientID
            VALUES ('${patient_name}', '${date_of_referral}', '${unique_id_1}', '${referral_type}', 
            '${unique_id_2 || ''}', '${unique_id_3 || ''}')
        `);

        res.json({ patientId: result.recordset[0].PatientID, message: "✅ Patient added successfully" });
    } catch (error) {
        console.error("❌ Error inserting patient:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * 2️⃣ Patient Admission Form
 */
app.post("/patientAdmitform", async (req, res) => {
    try {
        const { patient_id, date_of_admission, admission_status } = req.body;

        if (!patient_id || !date_of_admission || !admission_status) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const pool = await sql.connect(dbConfig);

        try {
            // Check if patient exists
            const checkPatient = await pool.request()
                .input("PatientID", sql.Int, patient_id)
                .query("SELECT TOP 1 PatientID FROM patiententry WHERE PatientID = @PatientID");

            if (checkPatient.recordset.length === 0) {
                return res.status(404).json({ error: "❌ Patient Entry Pending" });
            }
                // Same table Check
                
            // Insert Admission Data
            await pool.request()
                .input("PatientID", sql.Int, patient_id)
                .input("DateOfAdmission", sql.Date, date_of_admission)
                .input("StatusOfAdmission", sql.NVarChar, admission_status)
                .query(`
                    INSERT INTO Patientadmitconfirm (PatientID, DateOfAdmission, StatusOfAdmission) 
                    VALUES (@PatientID, @DateOfAdmission, @StatusOfAdmission)
                `);

            res.json({ success: true, message: "✅ Patient admitted successfully" });
        } finally {
            await pool.close();
        }

    } catch (error) {
        console.error("❌ Error inserting patient admission:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * 3️⃣ Patient Status Update
 */
app.post("/statusOfPatient", async (req, res) => {
    try {
        const { patient_id, admitted_to, department, type_admission, type_test, bill_amount } = req.body;

        if (!patient_id || !admitted_to || !department || !type_admission || !type_test || !bill_amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const pool = await sql.connect(dbConfig);

        try {
            // Check if patient exists
            const checkPatient = await pool.request()
                .input("PatientID", sql.Int, patient_id)
                .query("SELECT TOP 1 PatientID FROM patientadmitconfirm WHERE PatientID = @PatientID");

            if (checkPatient.recordset.length === 0) {
                return res.status(404).json({ error: "❌ Patient Entry Pending" });
            }
                // Same table data check 
                
            // Insert Patient Status Data
            await pool.request()
                .input("PatientID", sql.Int, patient_id)
                .input("AdmittedTo", sql.NVarChar, admitted_to)
                .input("Department", sql.NVarChar, department)
                .input("TypeAdmission", sql.NVarChar, type_admission)
                .input("TypeTest", sql.NVarChar, type_test)
                .input("BillAmount", sql.Decimal(10, 2), bill_amount)
                .query(`
                    INSERT INTO Status (PatientID, AdmittedTo, Department, TypeofAdmission, TypeofTest, BillAmount) 
                    VALUES (@PatientID, @AdmittedTo, @Department, @TypeAdmission, @TypeTest, @BillAmount)
                `);

            res.json({ success: true, message: "✅ Patient status updated successfully" });
        } finally {
            await pool.close();
        }

    } catch (error) {
        console.error("❌ Error updating patient status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * 4️⃣ Referral Payment Entry
 */
app.post("/referralPayment", async (req, res) => {
    try {
        const { 
            patient_id, 
            date_of_payment, 
            payment_status_1, 
            paid_amount_1, 
            payment_type, 
            payment_status_2, 
            paid_amount_2, 
            payment_status_3, 
            paid_amount_3 
        } = req.body;

        if (!patient_id || !date_of_payment || !payment_status_1 || !paid_amount_1 || !payment_type) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const pool = await sql.connect(dbConfig);

        try {
            // Check if patient exists
            const checkPatient = await pool.request()
                .input("PatientID", sql.Int, patient_id)
                .query("SELECT TOP 1 PatientID FROM status WHERE PatientID = @PatientID");

            if (checkPatient.recordset.length === 0) {
                return res.status(404).json({ error: "❌ Patient Entry Pending" });
            }

            // Insert Payment Data
            await pool.request()
                .input("PatientID", sql.Int, patient_id)
                .input("DateOfPayment", sql.Date, date_of_payment)
                .input("PaymentStatus1", sql.NVarChar, payment_status_1)
                .input("PaidAmount1", sql.Decimal(10, 2), paid_amount_1)
                .input("PaymentType", sql.NVarChar, payment_type)
                .input("PaymentStatus2", sql.NVarChar, payment_status_2 || "N/A")
                .input("PaidAmount2", sql.Decimal(10, 2), paid_amount_2 || 0)
                .input("PaymentStatus3", sql.NVarChar, payment_status_3 || "N/A")
                .input("PaidAmount3", sql.Decimal(10, 2), paid_amount_3 || 0)
                .query(`
                    INSERT INTO referral_payments 
                    (PatientID, DateOfPayment, PaymentStatus1, PaidAmount1, PaymentType, PaymentStatus2, PaidAmount2, PaymentStatus3, PaidAmount3) 
                    VALUES (@PatientID, @DateOfPayment, @PaymentStatus1, @PaidAmount1, @PaymentType, @PaymentStatus2, @PaidAmount2, @PaymentStatus3, @PaidAmount3)
                `);

            res.json({ success: true, message: "✅ Referral Payment Updated Successfully" });

        } finally {
            await pool.close();
        }

    } catch (error) {
        console.error("❌ Error inserting referral payment:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// ✅ Fetch All Patient Admissions with "Not Updated" for missing records
app.get("/patient-admissions", async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool.query(`
            SELECT 
    p.PatientID, 
    p.Name, 
    COALESCE(CONVERT(VARCHAR, TRY_CONVERT(DATE, p.DateOfReferral, 120), 23), 'Not Updated') AS DateOfReferral,
    p.ReferralType, 
    p.UniqueID1, 
    p.UniqueID2, 
    p.UniqueID3,
    COALESCE(CONVERT(VARCHAR, TRY_CONVERT(DATE, a.DateOfAdmission, 120), 23), 'Not Updated') AS DateOfAdmission,
    COALESCE(a.StatusOfAdmission, 'Not Updated') AS StatusOfAdmission,
    COALESCE(s.department, 'Not Updated') AS Department,
    COALESCE(s.admittedto, 'Not Updated') AS AdmittedTo,
    COALESCE(s.typeofadmission, 'Not Updated') AS TypeOfAdmission,
    COALESCE(s.typeoftest, 'Not Updated') AS TypeOfTest,
    COALESCE(CONVERT(VARCHAR, TRY_CONVERT(NUMERIC(18,2), s.billamount)), 'Not Updated') AS BillAmount
FROM patiententry p
LEFT JOIN patientadmitconfirm a ON p.PatientID = a.PatientID
LEFT JOIN status s ON p.PatientID = s.PatientID;

        `);

        res.json(result.recordset);
    } catch (error) {
        console.error("Error fetching patient admissions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




// Start Server
app.listen(5001, () => console.log("Server running on port 5001"));
//hello
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Service = require('./models/Service');
const Queue = require('./models/Queue');
const User = require('./models/User');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to Database...");

        // 1. Create a Service
        const doctorService = await Service.create({
            service_name: "Doctor Consultation",
            description: "General physician appointment"
        });

        // 2. Create a Queue for that Service
        const docQueue = await Queue.create({
            service: doctorService._id,
            current_token: 0
        });

        // 3. Create a Super Admin account
        const adminPassword = await bcrypt.hash("admin123", 10);
        await User.create({
            name: "Super Admin",
            email: "admin@smartqueue.com",
            password: adminPassword,
            role: "admin"
        });

        console.log("\n===========================================");
        console.log("✅ DATABASE READY FOR TESTING!");
        console.log("===========================================");
        console.log("Use this Admin Account to login:");
        console.log("Email: admin@smartqueue.com");
        console.log("Password: admin123");
        console.log("-------------------------------------------");
        console.log("Use this Queue ID for testing:");
        console.log(`QUEUE_ID: ${docQueue._id}`);
        console.log("===========================================\n");

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();

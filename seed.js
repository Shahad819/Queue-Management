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

        // Clear old data to start fresh
        await Service.deleteMany({});
        await Queue.deleteMany({});
        await User.deleteMany({});
        console.log("Old data cleared.");

        // 1. Create all 4 Services
        const services = await Service.insertMany([
            { service_name: "Doctor Consultation", description: "General physician appointment" },
            { service_name: "Bank Teller",         description: "Retail banking counter" },
            { service_name: "Government Desk",     description: "Civic registration and forms" },
            { service_name: "Customer Support",    description: "Help and support desk" }
        ]);

        // 2. Create a Queue for each Service
        const queues = await Queue.insertMany(
            services.map(s => ({ service: s._id, current_token: 0 }))
        );

        // 3. Create the Admin account
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
        console.log("Admin Login:");
        console.log("  Email:    admin@smartqueue.com");
        console.log("  Password: admin123");
        console.log("-------------------------------------------");
        console.log("Queue IDs:");
        services.forEach((s, i) => {
            console.log(`  ${s.service_name}: ${queues[i]._id}`);
        });
        console.log("===========================================\n");

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();

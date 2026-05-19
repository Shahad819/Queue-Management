// Select the database
use("smart_queue_system");

// Define the number of users you want to add
const n = 100; 

const users = [];

for (let i = 1; i <= n; i++) {
  // Simple random string generator for variety
  const randomId = Math.floor(Math.random() * 10000);
  const firstnameList = ["Arif", "Badhon", "Canchal","Dalim", "Mahim", "Saya", "Zayan","Ayesha","Rakesh"];
  const lastnameList = ["Hasan", "Khan", "Rahman", "Uddin", "Abedin", "Haque","Seikh","Ali"];
  const randomName = firstnameList[Math.floor(Math.random() * firstnameList.length)]+" "+lastnameList[Math.floor(Math.random() * lastnameList.length)];

  users.push({
    user_id: `USER${String(i).padStart(5, '0')}`, // Formats to USER00001, USER00002, etc.
    name: randomName,
    email: `${randomName.replace(/\s+/g, '').toLowerCase()}${randomId}@gmail.com`,
    password: Math.random().toString(36).slice(-8), // Generates a random 8-character password
    role: "customer",
    created_at: new Date()
  });
}

// Insert the array into the collection
db.users.insertMany(users);
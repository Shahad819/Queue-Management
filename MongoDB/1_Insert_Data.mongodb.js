use("smart_queue_system")

//Database Reset
db.dropDatabase();

// Create Counters Database

db.createCollection("counters")
//Insert Counters
db.counters.insertMany([
  { _id: "userId", seq: 0 },
  { _id: "serviceId", seq: 0 },
  { _id: "queueId", seq: 0 },
  { _id: "tokenId", seq: 0 },
  { _id: "feedbackId", seq: 0 },
  { _id: "notificationId", seq: 0 },
  { _id: "statId", seq: 0 }
])
//Increament Counters Function
function getNextSequence(name) {
  const result = db.counters.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { returnDocument: "after" }
  )
  return result.seq
}


const user1 = "USER" + String(getNextSequence("userId")).padStart(5, "0")
const user2 = "USER" + String(getNextSequence("userId")).padStart(5, "0")
const user3 = "USER" + String(getNextSequence("userId")).padStart(5, "0")
const user4 = "USER" + String(getNextSequence("userId")).padStart(5, "0")
const user5 = "USER" + String(getNextSequence("userId")).padStart(5, "0")

db.users.insertMany([
  {
    user_id: user1,
    name: "Rahim",
    email: "rahim@gmail.com",
    password: "123456",
    role: "customer",
    created_at: new Date()
  },
  {
    user_id: user2,
    name: "Karim",
    email: "karim@gmail.com",
    password: "123456",
    role: "customer",
    created_at: new Date()
  },
  {
    user_id: user3,
    name: "Admin",
    email: "admin@gmail.com",
    password: "admin123",
    role: "admin",
    created_at: new Date()
  },
  {
    user_id: user4,
    name: "Antu",
    email: "antum@gmail.com",
    password: "1245",
    role: "customer",
    created_at: new Date()
  },
  {
    user_id: user5,
    name: "Marim",
    email: "marim@gmail.com",
    password: "123456",
    role: "customer",
    created_at: new Date()
  }
])

// INSERT SERVICES
const service1 = "SERVICE" + String(getNextSequence("serviceId")).padStart(5, "0")

db.services.insertMany([
  { _id: service1, service_name: "University", description: "University Transaction" },
])

// INSERT QUEUES
const queue1 = "QUEUE" + String(getNextSequence("queueId")).padStart(5, "0")
const queue2 = "QUEUE" + String(getNextSequence("queueId")).padStart(5, "0")
const queue3 = "QUEUE" + String(getNextSequence("queueId")).padStart(5, "0")

db.queues.insertMany([
  { _id: queue1, service_id: service1, current_token: 1, created_at: new Date() },
  { _id: queue2, service_id: service1, current_token: 1, created_at: new Date() },
  { _id: queue3, service_id: service1, current_token: 1, created_at: new Date() }
])


// INSERT TOKENS
const token1 = "TOKEN" + String(getNextSequence("tokenId")).padStart(5, "0")
const token2 = "TOKEN" + String(getNextSequence("tokenId")).padStart(5, "0")
const token3 = "TOKEN" + String(getNextSequence("tokenId")).padStart(5, "0")
db.tokens.insertMany([
  {
    _id: token1,
    user_id: user1,
    queue_id: queue1,
    service_id: service1,
    token_number: 1,
    status: "serving",
    estimated_time: 0,
    created_at: new Date(),
    called_time: null,
    completed_time: null
  },
  {
    _id: token2,
    user_id: user2,
    queue_id: queue2,
    service_id: service1,
    token_number: 2,
    status: "waiting",
    estimated_time: 5,
    created_at: new Date(),
    called_time: new Date(),
    completed_time: null
  },
  {
    _id: token3,
    user_id: user3,
    queue_id: queue3,
    service_id: service1,
    token_number: 3,
    status: "waiting",
    estimated_time: 10,
    created_at: new Date(),
    called_time: new Date(),
    completed_time: null
  }
])


// INSERT FEEDBACKS
const fb1 = "FEEDBACK" + String(getNextSequence("feedbackId")).padStart(5, "0")
const fb2 = "FEEDBACK" + String(getNextSequence("feedbackId")).padStart(5, "0")
const fb3 = "FEEDBACK" + String(getNextSequence("feedbackId")).padStart(5, "0")
db.feedbacks.insertMany([
  {
    _id: fb1,
    user_id: user3,
    token_id: token3,
    rating: 5,
    comment: "Very good service",
    created_at: new Date()
  },
  {
    _id: fb2,
    user_id: user2,
    token_id: token2,
    rating: 4,
    comment: "Good",
    created_at: new Date()
  },
  {
    _id: fb3,
    user_id: user1,
    token_id: token1,
    rating: 3,
    comment: "Average",
    created_at: new Date()
  }
])

// INSERT NOTIFICATIONS
const n1 = "NOTIFICATION" + String(getNextSequence("notificationId")).padStart(5, "0")
const n2 = "NOTIFICATION" + String(getNextSequence("notificationId")).padStart(5, "0")
const n3 = "NOTIFICATION" + String(getNextSequence("notificationId")).padStart(5, "0")
db.notifications.insertMany([
  {
    _id:n1,
    user_id: user1,
    token_id: token1,
    message: "now serving your token",
    status: "read",
    created_at: new Date()
  },
  {
    _id:n2,
    user_id: user2,
    token_id: token2,
    message: "Your turn is near",
    status: "sent",
    created_at: new Date()
  },
  {
    _id:n3,
    user_id: user1,
    token_id: token3,
    message: "Your turn is near",
    status: "read",
    created_at: new Date()
  }
])

// INSERT STATISTICS
const s1 = "STAT" + String(getNextSequence("statId")).padStart(5, "0")
const s2 = "STAT" + String(getNextSequence("statId")).padStart(5, "0")
const s3 = "STAT" + String(getNextSequence("statId")).padStart(5, "0")
db.statistics.insertMany([
  {
    _id:s1,
    user_id: user1,
    queue_id: queue1,
    feedback_id: fb1,
    total_served: 20,
    avg_waiting_time: 10,
    date: new Date()
  },
  {
    _id:s2,
    user_id: user2,
    queue_id: queue2,
    feedback_id: fb2,
    total_served: 35,
    avg_waiting_time: 15,
    date: new Date()
  },
  {
    _id:s3,
    user_id: user3,
    queue_id: queue3,
    feedback_id: fb3,
    total_served: 10,
    avg_waiting_time: 8,
    date: new Date()
  }
])

print("Sample data inserted successfully!")

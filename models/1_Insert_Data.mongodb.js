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
  }
])

// INSERT SERVICES
const service1 = "SERVICE" + String(getNextSequence("serviceId")).padStart(5, "0")
const service2 = "SERVICE" + String(getNextSequence("serviceId")).padStart(5, "0")
const service3 = "SERVICE" + String(getNextSequence("serviceId")).padStart(5, "0")

db.services.insertMany([
  { _id: service1, service_name: "Doctor", description: "Doctor Appointment" },
  { _id: service2, service_name: "Bank", description: "Bank Service" },
  { _id: service3, service_name: "Admission", description: "University Admission" }
])

// INSERT QUEUES
const queue1 = "QUEUE" + String(getNextSequence("queueId")).padStart(5, "0")
const queue2 = "QUEUE" + String(getNextSequence("queueId")).padStart(5, "0")
const queue3 = "QUEUE" + String(getNextSequence("queueId")).padStart(5, "0")

db.queues.insertMany([
  { _id: queue1, service_id: service1, current_token: 5, created_at: new Date() },
  { _id: queue2, service_id: service2, current_token: 10, created_at: new Date() },
  { _id: queue3, service_id: service3, current_token: 2, created_at: new Date() }
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
    token_number: 6,
    status: "waiting",
    estimated_time: 15,
    created_at: new Date(),
    called_time: null,
    completed_time: null
  },
  {
    _id: token2,
    user_id: user2,
    queue_id: queue2,
    service_id: service2,
    token_number: 11,
    status: "serving",
    estimated_time: 5,
    created_at: new Date(),
    called_time: new Date(),
    completed_time: null
  },
  {
    _id: token3,
    user_id: user3,
    queue_id: queue3,
    service_id: service3,
    token_number: 3,
    status: "done",
    estimated_time: 0,
    created_at: new Date(),
    called_time: new Date(),
    completed_time: new Date()
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
db.notifications.insertMany([
  {
    user_id: user1,
    token_id: token1,
    message: "Your turn is near",
    status: "sent",
    created_at: new Date()
  },
  {
    user_id: user2,
    token_id: token2,
    message: "Now serving your token",
    status: "sent",
    created_at: new Date()
  },
  {
    user_id: user1,
    token_id: token3,
    message: "Service completed",
    status: "read",
    created_at: new Date()
  }
])

// INSERT STATISTICS
db.statistics.insertMany([
  {
    user_id: user1,
    queue_id: queue1,
    feedback_id: fb1,
    total_served: 20,
    avg_waiting_time: 10,
    date: new Date()
  },
  {
    user_id: user2,
    queue_id: queue2,
    feedback_id: fb2,
    total_served: 35,
    avg_waiting_time: 15,
    date: new Date()
  },
  {
    user_id: user3,
    queue_id: queue3,
    feedback_id: fb3,
    total_served: 10,
    avg_waiting_time: 8,
    date: new Date()
  }
])

print("Sample data inserted successfully!")
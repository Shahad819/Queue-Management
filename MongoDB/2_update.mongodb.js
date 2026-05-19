use("smart_queue_system")

// USERS

// Update user name
db.users.updateOne(
  { user_id: "USER00001" },
  { $set: { name: "Rahim Updated" } }
)

// Update user role
db.users.updateOne(
  {user_id: "USER00001" },
  { $set: { role: "admin" } }
)

// SERVICES
// Update service name
db.services.updateOne(
  { service_id: "SERVICE00001" },
  { $set: { service_name: "Updated Doctor Service" } }
)

// QUEUES

// Update current token number
db.queues.updateOne(
  { queue_id: "QUEUE00001" },
  { $set: { current_token: 20 } }
)

// TOKENS 
// Mark token as serving
db.tokens.updateOne(
  { token_id: "TOKEN00001" },
  { 
    $set: { 
      status: "serving",
      called_time: new Date()
    } 
  }
)

// Mark token as completed
db.tokens.updateOne(
  { token_id: "TOKEN00001" },
  { 
    $set: { 
      status: "done",
      completed_time: new Date()
    } 
  }
)

// Cancel token
db.tokens.updateOne(
  { token_id: "TOKEN00001" },
  { $set: { status: "cancelled" } }
)

// Update estimated time
db.tokens.updateMany(
  { queue_id: "QUEUE00001" },
  { $set: { estimated_time: 10 } }
)

// FEEDBACKS
// Update feedback rating
db.feedbacks.updateOne(
  { token_id: "TOKEN00001" },
  { $set: { rating: 5 } }
)

// NOTIFICATIONS
// Mark notification as read
db.notifications.updateMany(
  { user_id: "USER00001" },
  { $set: { status: "read" } }
)
// STATISTICS
// Update total served
db.statistics.updateOne(
  { queue_id: "QUEUE00001" },
  { $set: { total_served: 50 } }
)
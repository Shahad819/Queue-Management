use("smart_queue_system")

// USERS

// Delete one user
db.users.deleteOne({ user_id: "USER00003" })

// Delete all customers
db.users.deleteMany({ role: "customer" })

// SERVICES

// Delete a service
db.services.deleteOne({ service_id: "SERVICE00003" })

// QUEUES
// Delete a queue
db.queues.deleteOne({ queue_id: "QUEUE00003" })

// TOKENS (IMPORTANT)
// Delete one token
db.tokens.deleteOne({ token_id: "TOKEN00003" })

// Delete all cancelled tokens
db.tokens.deleteMany({ status: "cancelled" })

// FEEDBACKS

// Delete feedback for a token
db.feedbacks.deleteOne({ token_id: "TOKEN00001" })
// NOTIFICATIONS
// Delete all read notifications
db.notifications.deleteMany({ status: "read" })

// STATISTICS

// Delete stats of a queue
db.statistics.deleteOne({ queue_id: "QUEUE00003" })
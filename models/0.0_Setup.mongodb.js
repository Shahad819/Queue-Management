use("smart_queue");

// USERS
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password", "role"],
      properties: {
        name: { bsonType: "string" },
        email: { bsonType: "string" },
        password: { bsonType: "string" },
        role: { enum: ["customer", "admin"] },
        created_at: { bsonType: "date" }
      }
    }
  }
})

// SERVICES
db.createCollection("services", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["service_name"],
      properties: {
        service_name: { bsonType: "string" },
        description: { bsonType: "string" }
      }
    }
  }
})

// QUEUES
db.createCollection("queues", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["service_id"],
      properties: {
        service_id: { bsonType: "objectId" },
        current_token: { bsonType: "int" },
        created_at: { bsonType: "date" }
      }
    }
  }
})

// TOKENS
db.createCollection("tokens", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "queue_id", "token_number", "status"],
      properties: {
        user_id: { bsonType: "objectId" },
        queue_id: { bsonType: "objectId" },
        token_number: { bsonType: "int" },
        status: { enum: ["waiting", "serving", "done", "cancelled"] },
        estimated_time: { bsonType: "int" },
        created_at: { bsonType: "date" },
        called_time: { bsonType: ["date", "null"] },
        completed_time: { bsonType: ["date", "null"] }
      }
    }
  }
})

// FEEDBACKS
db.createCollection("feedbacks", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "token_id", "rating"],
      properties: {
        user_id: { bsonType: "objectId" },
        token_id: { bsonType: "objectId" },
        rating: { bsonType: "int" },
        comment: { bsonType: "string" },
        created_at: { bsonType: "date" }
      }
    }
  }
})

// NOTIFICATIONS
db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["user_id", "token_id", "message"],
      properties: {
        user_id: { bsonType: "objectId" },
        token_id: { bsonType: "objectId" },
        message: { bsonType: "string" },
        status: { enum: ["sent", "read"] },
        created_at: { bsonType: "date" }
      }
    }
  }
})

// STATISTICS
db.createCollection("statistics", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["queue_id", "date"],
      properties: {
        queue_id: { bsonType: "objectId" },
        total_served: { bsonType: "int" },
        avg_waiting_time: { bsonType: "int" },
        date: { bsonType: "date" }
      }
    }
  }
})

// INDEXES
db.tokens.createIndex({ queue_id: 1, status: 1 })
db.tokens.createIndex({ user_id: 1 })
db.notifications.createIndex({ user_id: 1 })
db.queues.createIndex({ service_id: 1 })

console.log(" Database setup completed")
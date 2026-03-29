use("smart_queue_system")

function viewCollection(collectionName, page = 1, limit = 10) {
  const skip = (page - 1) * limit

  print("Collection:"+String(collectionName))
  print("Page:"+String(page))


  const data = db.getCollection(collectionName)
    .find({})
    .skip(skip)
    .limit(limit)
    .toArray()

  if (data.length === 0) {
    print("No more data found.")
  } else {
    data.forEach(doc => printjson(doc))
  }
}

// VIEW EACH COLLECTION

// Change page number as needed
const page = 1

viewCollection("users", page)
viewCollection("services", page)
viewCollection("queues", page)
viewCollection("tokens", page)
viewCollection("feedbacks", page)
viewCollection("notifications", page)
viewCollection("statistics", page)

print("\n Data displayed (10 per collection)")

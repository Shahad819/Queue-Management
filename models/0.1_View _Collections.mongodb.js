use("smart_queue");


function viewCollection(collectionName, page = 1, limit = 10) {
  const skip = (page - 1) * limit

  console.log("Collection:"+String(collectionName))
  console.log("Page:"+String(page))


  const data = db.getCollection(collectionName)
    .find({})
    .skip(skip)
    .limit(limit)
    .toArray()

  if (data.length === 0) {
    console.log("No more data found.")
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

console.log("\n Data displayed (10 per collection)")
use("smart_queue_system")

function getNextSequence(name) {
  const result = db.counters.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );
  return result.seq;
}

function completeToken(token_id) {

  const token = db.tokens.findOne({ _id: token_id })

  if (!token) {
    print("Token not found")
    return
  }

  db.tokens.updateOne(
    { _id: token_id },
    {
      $set: {
        status: "done",
        completed_time: new Date()
      }
    }
  )

  print("Token completed:"+token_id)
}

function viewQueue(queue_id) {

  const tokens = db.tokens.find({ queue_id: queue_id }).sort({ token_number: 1 })

  print("Queue Status")

  tokens.forEach(t => {
    print("Token:"+ t.token_number,"Status:"+ t.status)
  })
}

completeToken("TOKEN00002")
viewQueue("QUEUE00001")
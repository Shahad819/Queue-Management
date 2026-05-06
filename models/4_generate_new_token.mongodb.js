use("smart_queue");
//
function generateToken(user_id, service_id) {

  const user = db.users.findOne({ user_id: user_id })

  if (!user) {
    print("User not registered")
    return
  }

  const queue = db.queues.findOne({ service_id: service_id })

  if (!queue) {
    print("Queue not found")
    return
   }

  const existing = db.tokens.findOne({
    user_id: user_id,
    service_id: "SERVICE00001",
    status: "waiting"
  })

  //Increament Counters Function
  function getNextSequence(name) {
  const result = db.counters.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { returnDocument: "after" }
  )
  return result.seq
  }

  if (existing) {
    print("User already has a waiting token:"+ existing.token_number)
    return
  }

  const tokenId =
    "TOKEN" + String(getNextSequence("tokenId")).padStart(5, "0")
 

  const lastToken = db.tokens
    //.find({ queue_id: queue._id })
    .find({service_id: 'SERVICE00001'})
    .sort({ token_number: -1 })
    .limit(1)
    .toArray()
  print("last token",lastToken)
  let nextTokenNumber = 1

  if (lastToken.length > 0) {
    nextTokenNumber = lastToken[0].token_number + 1
  }
  print("next token num "+nextTokenNumber)
/////////
  const estimatedTime =
    (nextTokenNumber - queue.current_token) * 10
  
  print("ESTIMATED TIME "+estimatedTime)

  db.tokens.insertOne({
    _id: tokenId,
    user_id: user_id,
    queue_id: queue._id,
    service_id: service_id,
    token_number: nextTokenNumber,
    status: "waiting",
    estimated_time: estimatedTime,
    created_at: new Date(),
    called_time: null,
    completed_time: null
  })

  const lastqueue = db.queues
    .find({service_id: 'SERVICE00001'})
    .sort({ _id: -1 })
    .limit(1)
    .toArray()
  
  const queue1 = "QUEUE" + String(getNextSequence("queueId")).padStart(5, "0")
 
  db.queues.insertOne(  { _id: queue1, service_id: "SERVICE00001", current_token: lastqueue[0].current_token, created_at: new Date() })
 
 const n1 = "NOTIFICATION" + String(getNextSequence("notificationId")).padStart(5, "0")
  db.notifications.insertOne({
    _id: n1 + String(getNextSequence("notificationId")).padStart(5,"0"),
    user_id: user_id,
    token_id: tokenId,
    message: "Your token has been generated",
    status: "sent",
    created_at: new Date()
  })

  print("Token generated successfully:"+ tokenId)
}

generateToken("USER00005","SERVICE00001")
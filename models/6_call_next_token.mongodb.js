use("smart_queue");

function getNextSequence(name) {
  const result = db.counters.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );
  return result.seq;
}


function callNextToken() {

  // Find currently serving token
  const token = db.tokens.findOne({ status: "serving" });

  if (token) {

    db.tokens.updateOne(
      { _id: token._id },
      {
        $set: {
          status: "done",
          completed_time: new Date()
        }
      }
    );

    print("Token completed: " + token._id);
  }

  // Find the next waiting token
  const nextToken = db.tokens
    .find({ status: "waiting" })
    .sort({ token_number: 1 })
    .limit(1)
    .toArray()[0];

  if (!nextToken) {
    print("No waiting tokens");
    return;
  }

  print("Next token found:");
  printjson(nextToken);

  // Update token → serving
  db.tokens.updateOne(
    { _id: nextToken._id },
    {
      $set: {
        status: "serving",
        called_time: new Date(),
        estimated_time: 0
      }
    }
  );

  // Update queue current token
  db.queues.updateOne(
    { _id: nextToken.queue_id },
    { $set: { current_token: nextToken.token_number } }
  );

  print("Now serving token number: " + nextToken.token_number);
}


function viewQueue(queue_id) {

  const tokens = db.tokens
    .find({ queue_id: queue_id })
    .sort({ token_number: 1 });

  print("----- Queue Status: " + queue_id + " -----");

  tokens.forEach(t => {
    print(
      "Token: " + t.token_number +
      " | ID: " + t._id +
      " | Status: " + t.status +
      " | Est Wait: " + t.estimated_time + "m"
    );
  });
}


const TEST_QUEUE = "QUEUE00002";

callNextToken();

viewQueue(TEST_QUEUE);
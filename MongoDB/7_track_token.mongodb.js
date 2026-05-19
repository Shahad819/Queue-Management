use("smart_queue_system")


function trackToken(token_id){

  const token = db.tokens.findOne({_id: token_id})

  if(!token){
    print("Token not found")
    return
  }

  const queue = db.queues.findOne({_id: token.queue_id})

  print("------ TOKEN STATUS ------")
  print("Token ID:"+token._id)
  print("Service ID:"+ token.service_id)
  print("Queue ID:"+ token.queue_id)
  print("Status:"+ token.status)

  if(token.status === "waiting"){

    const position = token.token_number - queue.current_token

    print("Current Serving:"+ queue.current_token)
    print("Your Token Number:"+ token.token_number)
    print("Position In Queue:"+position)
    print("Estimated Waiting Time:"+ token.estimated_time + " minutes")

  }

  if(token.status === "serving"){
    print("Your token is being served now")
  }

  if(token.status === "done"){
    print("Service completed at:"+ token.completed_time)
  }

}



trackToken("TOKEN00003")
use("smart_queue_system")

function cancelToken(token_id){

  const token = db.tokens.findOne({_id: token_id})

  if(!token){
    print("Token not found")
    return
  }

  if(token.status === "done" | "serving"){
    print("Cannot cancel completed token")
    return
  }

  
  db.tokens.updateOne(
    {_id: token_id},
    {
      $set:{
        status:"cancelled",
        called_time:null,
        completed_time:null
      }
    }
  )

  print("Token cancelled:", token_id)

}

/* TEST */
cancelToken("TOKEN00004")
const Queue = require('../models/Queue');
const Token = require('../models/Token');

const joinQueue = async (req, res) => {
    try{
        const {queueId} = req.body;

        const queue = await Queue.findById(queueId);
        if(!queue){
            return res.status(404).json({message: 'Queue not found'});
        }

        const existingToken = await Token.findOne({
            user: req.user._id,
            queue: queueId,
            status: 'waiting'
        });
        if (existingToken) {
            return res.status(400).json({message: 'You are already in this queue'})
        }

        const lastToken =  await Token.findOne({queue: queueId}).sort({token_number: -1});
        const nextTokenNumber = lastToken ? lastToken.token_number + 1: 1;

        const peopleWaiting = await Token.countDocuments({
            queue: queueId,
            status: 'waiting'       
        });
        const waitTime = peopleWaiting*5; //wait time 
        
        const newToken = await Token.create({
            user: req.user._id,
            queue: queueId,
            token_number: nextTokenNumber,
            estimated_time: waitTime
        });

        res.status(201).json({message: "Successfully joined the queue", token: newToken});
    } catch(error){
        res.status(500).json({message: 'Server error', error: error.message})
    
    }
};

const cancelToken = async (req, res) =>{
    try{
        const tokenId = req.params.id;

        const token = await Token.findById(tokenId);
        if(!token){
            return res.status(404).json({message: "Token not found."})
        }

        if (token.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: "You can only cancel your own tokens!"})
        }
        token.status = 'cancelled';
        await token.save();

        res.status(200).json({message:"Token canceled successfully."})

    }catch(error){
        res.status(500).json({message:'Server error', error: error.message});
    }
};

const trackMyToken = async(req, res)=>{
    try{
        const myToken = await Token.findOne({
            user: req.user._id,
            status: {$in: ['waiting', 'serving']}
        })
        if(!myToken){
            return res.status(404).json({ message: "You do not have an active queue token." });
        }

        const peopleAhead = await Token.countDocuments({
            queue: myToken.queue,
            status: "waiting",
            token_number: {$lt: myToken.token_number}
        });

        const newEstimatedTime = peopleAhead*5;

        res.status(200).json({
            message: "Token status fetched sussessfully.",
            token: myToken,
            people_ahead: peopleAhead,
            real_time_estimated_wait: newEstimatedTime
        });
    }catch(error){
        res.status(500).json({ message: "Server Error", error: error.message });
    }

}

module.exports = {joinQueue, cancelToken, trackMyToken};
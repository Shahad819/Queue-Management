const Queue = require('../models/Queue')
const Token = require('../models/Token')
const User = require('../models/User')

const callNextToken = async(req, res)=>{
    try{
        const{queueId} = req.body;

        const currentToken = await Token.findOne({
            queue: queueId,
            status: 'serving'
        });

        if (currentToken){
            currentToken.status = 'done';
            currentToken.completed_time = new Date()
            await currentToken.save();
        }

        const nextToken = await Token.findOne({queue: queueId, status: 'waiting' }).sort({ token_number: 1 })
        if (!nextToken){
            return res.status(200).json({message: "No more customers waiting in the queue."})
        }

        nextToken.status = "serving"
        nextToken.called_time = new Date();
        nextToken.estimated_time = 0;
        await nextToken.save();

        await Queue.findByIdAndUpdate(queueId, {current_token: nextToken.token_number})

        const io = req.app.get('io');

        io.to(queueId).emit('queue_updated', {
            message: "The queue has been updated.",
            current_token: nextToken.token_number
        });

        res.status(200).json({message: `Now serving Token #${nextToken.token_number}`, token: nextToken})
    }catch(error){
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

const skipToken = async(req, res)=>{
    try{
        const{queueId} = req.body;
        const currentToken = await Token.findOne({ queue: queueId, status: 'serving' });
        if (currentToken) {
            currentToken.status = 'skipped';
            await currentToken.save();
        }
        const nextToken = await Token.findOne({ queue: queueId, status: 'waiting' }).sort({ token_number: 1 });
        if (!nextToken) {
            return res.status(200).json({ message: "No more customers waiting in the queue!" });
        }
        nextToken.status = 'serving';
        nextToken.called_time = new Date();
        nextToken.estimated_time = 0;
        await nextToken.save();
        await Queue.findByIdAndUpdate(queueId, { current_token: nextToken.token_number });

        const io = req.app.get('io');

        io.to(queueId).emit('queue_updated', {
            message: "The queue has been updated.",
            current_token: nextToken.token_number
        });

        res.status(200).json({ message: `Skipped! Now serving Token #${nextToken.token_number}`, token: nextToken });
    }catch(error){
         res.status(500).json({ message: "Server Error", error: error.message });
    }
}

const blacklistUser = async(req, res)=>{
    try{
        const{userId} = req.body;
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({ message: "User not found" })
        }

        user.isBlacklisted = !user.isBlacklisted;
        await user.save()

        res.status(200).json({ 
            message: `User is now ${user.isBlacklisted ? "Blacklisted" : 'Un-blacklisted'}`, 
            user 
        });
    }catch(error){
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

const getDailyStats = async(req, res)=>{
    try{
        const{queueId} = req.params;

        const today = new Date()
        today.setHours(0,0,0,0)

        const tokensToday = await Token.find({
            queue: queueId,
            status: 'done',
            completed_time: {$gte: today}
        })

        const totalServed = tokensToday.length;
        
        let totalWaitTime = 0

        tokensToday.forEach(token => {
            const waitTimeMins = (token.called_time - token.createdAt)/60000

            totalWaitTime += waitTimeMins;
        })

        const avgWaitTime = totalServed > 0 ? (totalWaitTime/totalServed).toFixed(2) : 0

        res.status(200).json({
            message: "Daily Statistics",
            queueId,
            totalServed: totalServed,
            avgWaitTimeMins: avgWaitTime
        });
    
    }catch(error){
        res.status(500).json({ message: "Server Error", error: error.message });
    }

};

module.exports = {callNextToken, skipToken, blacklistUser, getDailyStats};
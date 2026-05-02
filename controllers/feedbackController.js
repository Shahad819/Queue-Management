const Feedback = require('../models/Feedback');
const Token = require('../models/Token');

const submitFeedback = async (req, res) =>{
    try{
        const {tokenId, rating, comment, isAnonymous} = req.body;

        const token = await Token.findById(tokenId)

        if(!token){
            return res.status(404).json({ message: "Token not found" });
        }
        if(token.status!=='done'){
            return res.status(400).json({ message: "You can only review completed services."});
        }

        const existingReview = await Feedback.findOne({token: tokenId});
        if(existingReview){
            return res.status(400).json({ message: "You already reviewed this service!"})
        }

        const feedback = await Feedback.create({
            user: isAnonymous? null:req.user._id,
            token: tokenId,
            rating,
            comment
        })
        res.status(201).json({ message: "Thank you for your feedback!", feedback });
    }catch(error){
        res.status(500).json({ message: "Server Error", error: error.message });
    }

}

module.exports = {submitFeedback}
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    try{
        const {name, email, password} = req.body;
        const userExists = await User.findOne({email});

        if(userExists){
            return res.status(400).json({message: "User with this email already exists."})
        }



const salt= await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

const user = await User.create({
    name: name,
    email: email,
    password: hashedPassword,
})

res.status(201).json({
    message: 'User registered successfully',
    user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    }
});

}
catch (error){
    res.status(500).json({message: "Server Error", error: error.message})
}
};

const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if (!user){
            return res.status(400).json({message: "Invalied email"})
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({message: "Invalid password"})
        }

        const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        )

        res.status(200).json({
            massage: "Login successful",
            token: token,
            user:{
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
    })} catch(error){
        res.status(500).json({message: "Server Error", error: error.message});
    }
};

module.exports = {registerUser, loginUser};
import { User } from "../model/user.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import generateChatId from "../utils/genrateId.js";
import cloudinary from "../config/cloudinary.config.js";
import { uploadImage } from "../utils/uplode.cloudinar.js";

export const Signup = async(req,res) => {
    const {name , email , password , confirmpassword} = req.body

    try{
        if(!name || !email || !password || !confirmpassword){
            return res.status(400).json({message : "All fields are required",status : false})
        }

        if(password !== confirmpassword){
            return res.status(400).json({
                message : "password and confirm password don not match" , status:false
            })
        }

        const userexists = await User.findOne({email})

        if(userexists){
            return res.status(409).json({message : "There's already user with same email!", status:false})
        }



        const hashpassword = await bcrypt.hash(password , 10)


        let chatId;

        while(true){
            chatId = generateChatId();

            const exists = await User.findOne({ chatId });

            if(!exists) break;
        }

        const newuser = await User.create({
            name,
            email,
            password : hashpassword,
            isVerified : true,
            chatId
        })

        return res.status(200).json({message : "user successfully created!!" ,status:true})

    }catch(err){
        console.log(err)
        return res.status(500).json({message : "server error",status:false})
    }
}


export const LoginUser = async(req,res) => {
    const {email,password} = req.body;

    try{
        if(!email || !password){
            return res.status(400).json({message : "All fields are required",status:false})

        }
        const user = await User.findOne({email})

        if(!user){
            return res.status(404).json({message : "Account not found,Please Sign Up first",status:false})
        }

        const cheackpassword = await bcrypt.compare(password , user.password)

        if(!cheackpassword){
            return res.status(400).json({message : "Password invalid",status:false})
        }

        const accessToken = jwt.sign({
            id : user._id,
            email : user.email
        },process.env.SECRET_KEY,{expiresIn : "1d"})

        const refreshToken = jwt.sign({
            id:user._id,
            email:user.email
        }, process.env.REFRESH_KEY,{
            expiresIn : "7d"
        })

        res.cookie("refreshToken" , refreshToken, {
            httpOnly : true,
            secure : false,
            sameSite : "lax",
            maxAge : 7 * 24 * 60 * 60 * 1000,
        });

        res.cookie("accessToken" , accessToken, {
            httpOnly : true,
            secure : false,
            sameSite : "lax",
            maxAge : 7 * 24 * 60 * 60 * 1000,
        });


        return res.status(200).json({message : "user created successfully!!" , status : true , accessToken : accessToken , refreshToken})

    }catch(err){
        return res.status(500).json({message : "server error" , status:false})
    }
}

export const RefreshToken = async(req,res) => {
    const  refreshToken  = req.cookies?.refreshToken;
    if(!refreshToken){
        return res.status(401).json({
            message: "Token not provided!",
        });
    }

    try{
        const decode = jwt.verify(
            refreshToken,
            process.env.REFRESH_KEY
        )

        const newAccessToken = jwt.sign(
            {
                id: decode.id,
                email: decode.email,
            },
            process.env.SECRET_KEY,
            {
                expiresIn: "15m"
            }
        )

        const newRefreshToken = jwt.sign(
            {
                id: decode.id,
                email: decode.email,
            },
            process.env.REFRESH_KEY,
            {
                expiresIn: "7d"
            }
        )

      res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

        return res.status(200).json({
            status: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        })
    }catch(error){
        return res.status(403).json({
            message : "Invalid or expired refresh token",
            status: false,
        });
    }
}

export const GetAllUser = async(req,res) => {
    try { 
        const AllUser = await User.find().select("name")

        if(!AllUser){
            return res.status(400).json({message : "no user found!!",status:true})
        }

        return res.status(200).json({message : "User fatched successfully !!" , status : true , user : AllUser})

    }catch(err){
        console.log(err)
        return res.status(500).json({message : "Server error" , status : false})
    }
}

export const searchUser = async(req,res) => {
    const { chatId } = req.params;
    try{
        const user = await User.findOne({ chatId }).select("-password");

        if(!user){
            return res.status(404).json({
                message : "User not found" , status : false
            })
        }

        return res.status(200).json({status:true, user})

    }catch(err){
        console.log(err)
        return res.status(500).json({message : "server error",status : false})
    }
}

export const Getme = async(req,res) => {
        const userId = req.userid
    try{
        const user = await User.findById(userId).select("-password -__v")

        if(!user){
            return res.status(409).json({message : "User not found" , status : false})
        }

        return res.status(200).json({message : "profile fetch successfully" , data : user})

    }catch(err){
        return res.status(500).json({message : "server error" , status : false})
    }
}


export const UpdateProfile = async(req,res) => {
    const { name , bio , role , location , website  } = req.body
    try{
        const avatar = req.files?.avatar?.[0];
        const cover = req.files?.cover?.[0];

        const user = await User.findById(req.userid)

        if(!user){
            return res.status(404).json({message : "user not found" , status:false})
        }

        if(name !== undefined) user.name = name;
        if(bio !== undefined) user.profile.bio = bio;
        if(role !== undefined) user.profile.role = role;
        if(location !== undefined) user.profile.location = location;
        if(website !== undefined) user.profile.website = website;
        

        if(avatar){
            if(user.images.avatar.public_id){
                await cloudinary.uploader.destroy(
                    user.images.avatar.public_id
                );
            }

            const avatarResult = await uploadImage(avatar,"avatars")

            user.images.avatar = {
                url: avatarResult.secure_url,
                public_id: avatarResult.public_id,
            }
        }

    if (cover) {
      if (user.images.cover.public_id) {
        await cloudinary.uploader.destroy(
          user.images.cover.public_id
        );
      }

      const coverResult = await uploadImage(cover, "covers");

      user.images.cover = {
        url: coverResult.secure_url,
        public_id: coverResult.public_id,
      };
    }

    await user.save();

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
}

export const LogOut = async(req,res) => {
    res.clearCookie("refreshToken" , "accessToken");

    return res.json({
        message : "Logout",status:true
    })
   
}
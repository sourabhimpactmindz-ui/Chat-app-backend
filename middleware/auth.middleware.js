import jwt from 'jsonwebtoken'

export const userAuth = async(req,res,next) => {
    const token = req.cookies.accessToken;

    if(!token){
        return res.status(401).json({message: "token missing" , status : false})
    }
    try{
        const decode = jwt.verify(token,process.env.SECRET_KEY)
        req.userid=decode.id
        next()
    }catch (err) {
    console.log("JWT ERROR:", err.name, err.message); 
    if (err && err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired", status: false });
    }
    return res.status(401).json({ message: "Invalid token", status: false });

}
}

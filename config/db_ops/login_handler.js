var bcrypt = require('bcrypt');
var User = require('./userschema');

async function handler( req, res){
  try{
    ///let {fullname,email,password}= req.body;

    user = await User.findOne(
      {
        email: req.body.email.toLowerCase(),
      },
      {
        email: 1,
        password: 1,
        _id: 1,
      }
    );
      console.log(user);
    if(!user)  res.status(500).json({message:'Sorry could not find you check your login details or signup'});
    else{
      console.log(` from login ${user.password.toString()}`);
      let pwd = await bcrypt.compare(req.body.password,user.password.toString() );
      if(!pwd){
        res.status(500).json({message:'Sorry check your password'});      
      }
      else{
        res.redirect(`/new/${user._id}`);
      }
    }
    
  
  } catch(err){
    console.log(err);
    return res.status(500).json({message:'Sorry could not Login you in'});
  }


}

module.exports = handler;
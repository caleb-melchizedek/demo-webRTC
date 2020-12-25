var bcrypt = require('bcrypt');
var User = require('./userschema');

async function handler( req, res){
  try{
    let {fullname,email,password}= req.body;

    userEmail = await User.findOne({ email: email.toLowerCase() });
    if(userEmail){
      return res.status(422).json({message:'Sorry this user already exists'});
    }
    else{
      
      let hashpwd = await bcrypt.hash(password,10);
      let newUser= new User({
        fullname,
        email:email.toLowerCase(),
        password:hashpwd
      });
      try{
      await newUser.save()
        .then(doc=>{
          console.log(doc);
         // return doc;
         res.redirect(`/new/${doc._id}`);
        })
      
      }catch(err){
        console.log(`couldnt save new user to database due error:${err}`);
        res.end
      }
    }
    
  } catch(err){
    console.log(err);
    return res.status(500).json({message:'Sorry could not create your account'});
  }

}

module.exports = handler;
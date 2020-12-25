var User = require('../config/db_ops/userschema');

module.exports=
  function(req, res,) {
    console.log(req.params.user_id)
     User.findOne(
     {_id:req.params.user_id},
      {
        _id:1,
        fullname:1,
         email:1
      },
      function(err,data){
        if (err) console.log(err);

        console.log(`from new.js user info is: ${data}`);
        res.render('new',{user:data.fullname});
        res.end();
        }
      )
      // ).then(user=>{
      //   console.log(`user info is: ${user}`);
      //   res.end();
        //res.render(); 
    
  }
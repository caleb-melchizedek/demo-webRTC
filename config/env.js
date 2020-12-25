module.exports= {
  
  database:{
    url:process.env.MONGODB_URI,
    options:{
      useNewUrlParser: true,
       useFindAndModify: false,
       useCreateIndex: true,
      useUnifiedTopology: true,
    },
  },
  
}
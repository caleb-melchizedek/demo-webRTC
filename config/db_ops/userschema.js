const mongoose = require('mongoose'),
  Schema = mongoose.Schema;

  let UserSchema = new Schema(
    {
    fullname: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
      },
      password: {
        type: Buffer,
        required: true,
      }
    }
  );
  
  module.exports = mongoose.model('User', UserSchema);
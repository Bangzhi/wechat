import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
const saltRounds = 10
const Schema = mongoose.Schema
const UserSchema = new Schema({
  nickname: String,
  avatar: String,
  sex: String,
  role: {
    type: String,
    default: "user"
  },
  mobile: String,
  password: String,
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

UserSchema.pre('save', function(next) {
  const _this = this

  if (_this.isNew) {
    _this.meta.createAt = _this.meta.updateAt = Date.now()
  } else {
    _this.meta.updateAt = Date.now()
  }

  next()
})

UserSchema.pre('save', function(next) {
  const _this = this
  
  if (!_this.isModified('password')) return next() 

  bcrypt.genSalt(saltRounds, function(err, salt) {
    if (err) return next(err)
    bcrypt.hash(_this.password, salt, function(err, hash) {
      if (err) return next(err)
      _this.password = hash
      next()
    })
  })
})

UserSchema.method({
  comparePassword: async function(_password, password) {
    const isMatch = await bcrypt.compare(_password, password)

    return isMatch
  }
})

export default mongoose.model('User', UserSchema)
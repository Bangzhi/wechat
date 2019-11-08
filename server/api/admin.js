import mongoose from 'mongoose'
const User  = mongoose.model('User')

export async function login (mobile, password) {
  let isMatch = false
  let user = await User.findOne({mobile: mobile}).exec()
  console.log(user)

  if (user) {
    isMatch = await user.comparePassword(password, user.password)
  } 
  
  return {
    user,
    isMatch
  }
}

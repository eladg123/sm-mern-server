import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import AsyncHandler from 'express-async-handler'

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    let decodedData
    if (token) {
      decodedData = jwt.verify(token, 'test')
      req.userId = decodedData?.id
    }
    next()
  } catch (error) {
    console.log(error)
  }
}

// const auth = AsyncHandler(async (req, res, next) => {
//   const token = req.headers.authorization.split(' ')[1]
//   if (token) {
//     try {
//       const decoded = jwt.verify(token, 'test')
//       req.userId = await User.findById(decoded.id).select('-password')
//       next()
//     } catch (error) {}
//   } else {
//     res.status(401).json({ message: 'Not authorized, no token!' })
//   }
// })

export default auth

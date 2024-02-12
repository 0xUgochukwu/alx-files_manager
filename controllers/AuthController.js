import dbClient from '../utils/db';
import redisClient from '../utils/redis'
import sha1 from 'sha1';
import { v4 } from 'uuid';
import { ObjectId } from 'mongodb'

export default class AuthController {
      static async getConnect(request, response) {
         const Auth = request.headers['authorization'].split(' ')
         if (Auth.length === 2) {
           const userCredential = Auth[1]
           const base64Decode = Buffer.from(userCredential, 'base64').toString('binary')
           const email = base64Decode.split(':')[0]
           const password = sha1(base64Decode.split(':')[1])
           let user = await dbClient.findUser(email)
	   console.log(user)
	   if(user) {
               if(password === user.password){
                   const token = v4()
                   const key = `auth_${token}`
                   await redisClient.set(key, user._id.toString(), (24 * 3600))
                   response.status(200).send({ "token": token})
	       }
            } else {
		    response.status(401).send({'error': 'Unauthorized'})
	    }
	   }
      }
      static async getDisconnect(request, response) {
           const token = request.headers['x-token']
           const id = await redisClient.get(`auth_${token}`)
           if(id) {
	       const _id = new ObjectId(id)
               const user = await dbClient.findUser(_id)
	       if (user) {
		       await redisClient.del(`auth_${token}`)
		       response.status(204)
	       } 
		   else {
			   response.status(401).send({'error': 'Unauthorized'})
		   }
	   }
      }
}
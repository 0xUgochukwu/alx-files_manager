import dbClient from '../utils/db'
import redisClient from '../utils/redis'
import { ObjectId } from 'mongodb'

export default class FilesController{
    static async getShow(request, response) {
        const id = request.params['id']
	const _id = new ObjectId(id)
	const token = request.headers['x-token']
        const userId = await redisClient.get(`auth_${token}`)
	const file = await dbClient.findFile(_id)
	if(file && userId) {
                     const ID = new ObjectId(userId)
	             const user = await dbClient.findUser(ID)
	            if (!user) {
			    response.status(401).json({"error": "Unauthorized" })
		    } else if( userId === file.userId) {
			    response.status(200).json(file)
		    } else {
			    response.status(404).json({'error': 'Not found'})
		    }
	}
    }
    static async getIndex(request, response) {}
}

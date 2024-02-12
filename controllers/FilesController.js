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
		if (userId === file.userId) { 
	            response.send(file)
		}
	}
    }
    static async getIndex(request, response) {}
}

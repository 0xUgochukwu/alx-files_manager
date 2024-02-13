import dbClient from '../utils/db';

export default class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      return response.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).send({ error: 'Missing password' });
    }

    let user = await dbClient.findUser({ email });
    if (user) {
      return response.status(400).send({ error: 'Already exist' });
    }

    user = await dbClient.createUser(email, password);
    return response.status(201).send({ email: user.email, id: user._id.toString() });
  }

  static async getMe(request, response) {
    response.status(200).send({
      email: request.user.email,
      id: request.user._id.toString(),
    });
  }
}

import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

export default function routes(app) {
  app.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });
  app.get('/stats', (req, res) => {
    AppController.getStats(req, res);
  });
  app.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });
}

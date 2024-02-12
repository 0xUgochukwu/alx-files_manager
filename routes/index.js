import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

export default function routes(app) {
  app.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });
  app.get('/stats', (req, res) => {
    AppController.getStats(req, res);
  });
  app.get('/connect', (req, res) => {
     
    //console.log(req.headers['authorization'].split(" "))
    AuthController.getConnect(req, res)
  })
  app.get('/disconnect', (req, res) => {
    AuthController.getDisconnect(req, res)
  })
  app.get('/users/me', (req, res) => {
    UsersController.getMe(req, res)
  })
  app.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });
}

import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import { getUserFromToken } from '../middlewares/auth';

export default function routes(app) {
  app.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });
  app.get('/stats', (req, res) => {
    AppController.getStats(req, res);
  });
  app.get('/connect', (req, res) => {
    AuthController.getConnect(req, res);
  });
  app.get('/disconnect', getUserFromToken, (req, res) => {
    AuthController.getDisconnect(req, res);
  });
  app.get('/users/me', getUserFromToken, (req, res) => {
    UsersController.getMe(req, res);
  });
  app.get('/files/:id', (req, res) => {
    FilesController.getShow(req, res);
  });
  app.get('/files', (req, res) => {
    FilesController.getIndex(req, res);
  });
  app.post('/users', (req, res) => {
    UsersController.postNew(req, res);
  });
}

import AppController from '../controllers/AppController';

export default function routes(app) {
  app.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });
  app.get('/stats', (req, res) => {
    AppController.getStats(req, res);
  });
}

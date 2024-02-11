import express from 'express';
import routes from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

routes(app);

app.listen(port);

import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes.js';
import actRoutes from './routes/actRoutes.js';
import weightRoutes from './routes/weightRoutes.js';
import calRoutes from './routes/calRoutes.js';
import bodyRoutes from './routes/bodyRoutes.js';
import dbMiddleware from './middleware/dbMiddleware.js';
import multerMiddleware from './middleware/multerMiddleware.js';
import cors from 'cors';
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(dbMiddleware);
app.use(cors());

app.use('/api/:version/users', multerMiddleware, userRoutes);
app.use('/api/:version/activities', actRoutes);
app.use('/api/:version/weights', weightRoutes);
app.use('/api/:version/cals', calRoutes);
app.use('/api/:version/bodies', bodyRoutes);
app.get('/healthcheck', (req, res) => {
    res.send('OK');
})

app.listen(4000, () => {
    console.log('Listening on port 4000');
});
import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes.js';
import actRoutes from './routes/actRoutes.js';
import dbMiddleware from './middleware/dbMiddleware.js';
import cors from 'cors';
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(dbMiddleware);
app.use(cors());
app.use('/api/:version/users', userRoutes);
app.use('/api/:version/activities', actRoutes);
app.get('/healthcheck', (req, res) => {
    res.send('OK');
})

app.listen(4000, () => {
    console.log('Listening on port 4000');
});
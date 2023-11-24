import express from 'express';
import bodyParser from 'body-parser';
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.get('/healthcheck', (req, res) => {
    res.send('OK');
})

app.listen(4000, () => {
    console.log('Listening on port 4000');
});
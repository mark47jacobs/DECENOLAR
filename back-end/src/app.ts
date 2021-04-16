const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');

const config1 = require('./config');
const routes = require('./routes/apis');

const app = express();

mongoose.connect(config1.database, { useNewUrlParser: true, useUnifiedTopology: true },);
mongoose.Promise = global.Promise;
mongoose.connection.on('error', (err) => {
    console.log('Error in the database:', err);
});

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/*', (req, res) => {
    res.json({
        message: 'app runnig',
    });
});

const PORT = process.env.PORT || config1.httpPort;

app.listen(PORT, () => {
    console.log(`We have a ${config1.name} server running on PORT: ${PORT}`);
});
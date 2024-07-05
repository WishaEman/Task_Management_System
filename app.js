const express = require('express');
require('dotenv').config();
const cors = require('cors');
require('module-alias/register');

const app = express();
  
app.use(cors());
app.use(express.json());

const port = process.env.PORT ? process.env.PORT : 3000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

require("./src/config/sequelize");
require("./config/config");
require("./src/models/index");

const designationRoutes = require('./src/routes/designationRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const serverPortRoutes = require('./src/routes/serverPortRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const userProductRoutes = require('./src/routes/userProductRoutes');


app.use('/api/designations', designationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/server-ports', serverPortRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', userProductRoutes);


// 404 Not Found Middleware
app.use((req, res, next) => {
    res.status(404).send({ error: 'URL not found' });
});
  
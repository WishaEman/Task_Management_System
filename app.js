const express = require('express');
require('dotenv').config();
const cors = require('cors');
require('module-alias/register');
const authMiddleware = require('./src/middleware/auth');
const app = express();
  
app.use(cors());
app.use(express.json());
// Apply authMiddleware to all routes except /api/login
app.use(
    authMiddleware.unless({
        path: [
            { url: '/api/users/login', methods: ['POST'] },
            { url: '/api/users/', methods: ['POST'] },
        ]
    })
);

const port = process.env.PORT ? process.env.PORT : 3000;

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

require("./src/config/sequelize");
require("./config/config");
require("./src/models/index");
require("./cronJob");
require("./src/config/redis");


app.use('/api/designations', require('./src/routes/designationRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/server-ports', require('./src/routes/serverPortRoutes'));
app.use('/api/tasks', require('./src/routes/taskRoutes'));
app.use('/api', require('./src/routes/userProductRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// 404 Not Found Middleware
app.use((req, res, next) => {
    res.status(404).send({ error: 'URL not found' });
});
  
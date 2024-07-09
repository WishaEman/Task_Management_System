const redis = require('redis');
const { promisify } = require('util');
const client = redis.createClient();

client.on('error', (err) => {
    console.error('Redis error:', err);
});

client.on('connect', () => {
    console.log('Connected to Redis');
});


(async () => {
    await client.connect();
})();

const getAsync = () => promisify(client.get).bind(client);

module.exports = {
    client,
    getAsync
};

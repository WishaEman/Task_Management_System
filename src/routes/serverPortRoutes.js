const express = require('express');
const router = express.Router();
const {
    createServerPort,
    getAllServerPorts,
    getServerPortStatus
} = require('../controllers/serverPortController');

router.post('/', createServerPort);
router.get('/', getAllServerPorts);
router.get('/:portNumber/status', getServerPortStatus);

module.exports = router;

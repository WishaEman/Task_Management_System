const { ServerPortService } = require('@services/serverPortService');
const { body, param, validationResult } = require('express-validator');

const serverPortService = new ServerPortService();

exports.createServerPort = [
  body('portNumber').isInt().withMessage('Port number must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { portNumber } = req.body;

    try {
      const serverPort = await serverPortService.createServerPort(portNumber);
      res.status(201).json(serverPort);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.getAllServerPorts = async (req, res) => {
  try {
    const serverPorts = await serverPortService.getAllServerPorts();
    res.status(200).json(serverPorts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getServerPortStatus = [
  param('portNumber').isInt().withMessage('Port number must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { portNumber } = req.params;

    try {
      const status = await serverPortService.getServerPortStatus(parseInt(portNumber));
      res.status(200).json({ portNumber, status });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
];

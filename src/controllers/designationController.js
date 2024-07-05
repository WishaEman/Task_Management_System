const { DesignationService } = require('@services/designationService');
const designationService = new DesignationService();

exports.createDesignation = async (req, res) => {
  try {
    const designation = await designationService.createDesignation(req.body);
    res.status(201).json(designation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllDesignations = async (req, res) => {
  try {
    const designations = await designationService.getAllDesignations();
    res.status(200).json(designations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDesignationById = async (req, res) => {
  try {
    const designation = await designationService.getDesignationById(parseInt(req.params.id, 10));
    res.status(200).json(designation);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.updateDesignation = async (req, res) => {
  try {
    const designation = await designationService.updateDesignation(parseInt(req.params.id, 10), req.body);
    res.status(200).json(designation);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

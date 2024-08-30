// server/controllers/salesmanController.js
const Salesman = require("../models/Salesman");
const EnrolledUser = require("../models/EnrolledUser");

exports.createSalesman = async (req, res) => {
  try {
    const salesman = new Salesman(req.body);
    await salesman.save();
    res.status(201).json(salesman);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getSalesman = async (req, res) => {
  try {
    const salesman = await Salesman.findById(req.params.id).populate(
      "enrolledUsers"
    );
    res.status(200).json(salesman);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.getAllSalesmen = async (req, res) => {
  try {
    const salesmen = await Salesman.find().populate("enrolledUsers");
    res.status(200).json(salesmen);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateSalesman = async (req, res) => {
  try {
    const salesman = await Salesman.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(salesman);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteSalesman = async (req, res) => {
  try {
    await Salesman.findByIdAndDelete(req.params.id);
    res.status(204).json();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.enrollUser = async (req, res) => {
  try {
    const { salesmanId, ...userData } = req.body;
    const user = new EnrolledUser(userData);
    await user.save();

    const salesman = await Salesman.findById(salesmanId);
    salesman.enrolledUsers.push(user._id);
    await salesman.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

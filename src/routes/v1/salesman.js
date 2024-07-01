// server/routes/salesman.js
const express = require("express");
const router = express.Router();
const salesmanController = require("../../controllers/salesmanController");

router.post("/", salesmanController.createSalesman);
router.get("/:id", salesmanController.getSalesman);
router.get("/", salesmanController.getAllSalesmen);
router.put("/:id", salesmanController.updateSalesman);
router.delete("/:id", salesmanController.deleteSalesman);
router.post("/enroll", salesmanController.enrollUser);

module.exports = router;

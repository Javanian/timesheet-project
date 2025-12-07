const express = require("express");
const router = express.Router();
const controller = require("../controllers/sowController");

router.get("/", controller.getAll);
router.get("/data", controller.get2data);
router.get("/datajson", controller.getDataJSON);
router.get("/mesin/:order", controller.getbymesinid);
router.get("/csv/", controller.getcsv);
router.get("/csv/:order_no", controller.getcsvbyid);
router.get("/:order", controller.getById);
router.get("/search/:ssbr_id/:group", controller.getBySSBRAndGroup);
router.post("/", controller.create);
router.post("/createex/", controller.createexcel);
router.post("/upsert", controller.upsert);
router.put("/updateex/:id", controller.updateexcel);
router.put("/finish/", controller.finish);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;

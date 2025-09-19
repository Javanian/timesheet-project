const express = require("express");
const router = express.Router();
const controller = require("../controllers/usernfcController");


router.get("/", controller.getAll);
router.get("/nfcid/:nfcid", controller.getdatausernfc);
router.get("/nama/:nama", controller.getname);
router.post("/", controller.create);
router.put("/update/", controller.updatemesin);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

module.exports = router;

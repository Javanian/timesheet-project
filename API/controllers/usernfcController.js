const db = require("../db");

// GET all
exports.getAll = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM usernfc");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET by ID
exports.getdatausernfc= async (req, res) => { 
  try {
    const { nfcid } = req.params; 
    const result = await db.query('SELECT * FROM usernfc WHERE "nfcid" = $1', [nfcid]); 
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getname= async (req, res) => { 
  try {
    const { nama } = req.params; 
    const result = await db.query('SELECT * FROM usernfc WHERE "full_name" = $1', [nama]); 
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { name } = req.body; // contoh field
    const result = await db.query(
      "INSERT INTO usernfc (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await db.query(
      "UPDATE usernfc SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatemesin = async (req, res) => {
  // ambil sn dari sessionStorage
  try {
    const { 
      serialnumber, 
      machineid,
      machinename,
      workcenter } = req.body;

    const result = await db.query(
      `UPDATE usernfc
         SET 
         machineid = $1,
         machinename = $2,
         workcenter = $3
       WHERE snssb = $4
       RETURNING *`,
      [machineid, machinename, workcenter, serialnumber]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error update data');
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM usernfc WHERE id = $1", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

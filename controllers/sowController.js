const db = require("../db");

// GET all
exports.getAll = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM sow");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET by ID
exports.getById = async (req, res) => {
  try {
    const { order } = req.params;
    const result = await db.query('SELECT * FROM sow WHERE "order_no" = $1 ORDER BY operation_no ASC', [order]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getbymesinid = async (req, res) => {
  try {
    const { order } = req.params;
    const { workcenter } = req.query; // ambil dari body

    const result = await db.query(
      'SELECT * FROM sow WHERE "order_no" = $1 AND workcenter = $2 ORDER BY operation_no ASC',
      [order, workcenter]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// CREATE
exports.create = async (req, res) => {
  try {
    const { name } = req.body; // contoh field
    const result = await db.query(
      "INSERT INTO sow (name) VALUES ($1) RETURNING *",
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
      "UPDATE sow SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//========================//
exports.finish = async (req, res) => {
  try {
    const { selectedactivity } = req.body;
    const { production_order, operation_no } = selectedactivity;
    const status = "FINISH";
    const longdate_checkout = new Date();

    const result = await db.query(
      `UPDATE sow
         SET status = $1,
             finish_date = $2
       WHERE order_no = $3 AND operation_no = $4
       RETURNING *`,
      [status, longdate_checkout, production_order, operation_no]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};






// DELETE
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM sow WHERE id = $1", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



//=API EXCEL=========

// CREATE
exports.createexcel = async (req, res) => {
  try {
    const {
      order_no,
      operation_no,
      ssbr_id,
      part_number,
      part_name,
      model,
      customer,
      location,
      wct_group,
      workcenter,
      operationtext,
      workcenterdescription,
      planhours,
      confirmation
    } = req.body;

    const result = await db.query(
      `INSERT INTO sow (
        order_no,
        operation_no,
        ssbr_id,
        part_number,
        part_name,
        model,
        customer,
        location,
        wct_group,
        workcenter,
        operationtext,
        workcenterdescription,
        planhours,
        confirmation
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14
      )
      RETURNING *`,
      [
        order_no,
        operation_no,
        ssbr_id,
        part_number,
        part_name,
        model,
        customer,
        location,
        wct_group,
        workcenter,
        operationtext,
        workcenterdescription,
        planhours,
        confirmation
      ]
    );

    // idsow & codenumber otomatis di-generate oleh PostgreSQL
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
exports.updateexcel = async (req, res) => {
  try {
    const { id } = req.params; // id = idsow
    const {
      order_no,
      operation_no,
      ssbr_id,
      part_number,
      part_name,
      model,
      customer,
      location,
      wct_group,
      workcenter,
      operationtext,
      workcenterdescription,
      planhours,
      confirmation
    } = req.body;

    const result = await db.query(
      `UPDATE sow SET
        order_no = $1,
        operation_no = $2,
        ssbr_id = $3,
        part_number = $4,
        part_name = $5,
        model = $6,
        customer = $7,
        location = $8,
        wct_group = $9,
        workcenter = $10,
        operationtext = $11,
        workcenterdescription = $12,
        planhours = $13,
        confirmation = $14
      WHERE idsow = $15
      RETURNING *`,
      [
        order_no,
        operation_no,
        ssbr_id,
        part_number,
        part_name,
        model,
        customer,
        location,
        wct_group,
        workcenter,
        operationtext,
        workcenterdescription,
        planhours,
        confirmation,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getcsv = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM sow");
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }
    
    // Ambil nama kolom dari hasil query
    const columns = Object.keys(result.rows[0]);
    
    // Buat header CSV
    const csvHeader = columns.join(',') + '\n';
    
    // Convert data ke format CSV
    const csvData = result.rows.map(row => {
      return columns.map(col => {
        let value = row[col];
        // Handle null/undefined values
        if (value === null || value === undefined) {
          value = '';
        }
        // Escape double quotes dan wrap dengan quotes jika perlu
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      }).join(',');
    }).join('\n');
    
    // Set header response sebagai CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sow_data.csv"');
    
    // Kirim CSV data
    res.send(csvHeader + csvData);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getcsvbyid = async (req, res) => {
  try {
    const { order_no } = req.params; // ambil dari URL

    const result = await db.query(
      "SELECT * FROM sow WHERE order_no = $1",
      [order_no]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    // Ambil nama kolom dari hasil query
    const columns = Object.keys(result.rows[0]);

    // Buat header CSV
    const csvHeader = columns.join(",") + "\n";

    // Convert data ke format CSV
    const csvData = result.rows
      .map((row) => {
        return columns
          .map((col) => {
            let value = row[col];
            if (value === null || value === undefined) {
              value = "";
            }
            if (
              typeof value === "string" &&
              (value.includes(",") || value.includes('"') || value.includes("\n"))
            ) {
              value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
          })
          .join(",");
      })
      .join("\n");

    // Set header response sebagai CSV
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="sow_${order_no}.csv"`);

    // Kirim CSV data
    res.send(csvHeader + csvData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

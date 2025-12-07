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

exports.get2data = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM sow WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND (order_no ILIKE $1 OR ssbr_id ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY operation_no ASC';

    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

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
          .join(";");
      })
      .join("\n");

    // PERBAIKAN: Gunakan 'search' bukan 'order_no'
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="sow_${search || 'all'}.csv"`);

    // Kirim CSV data
    res.send(csvHeader + csvData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Endpoint baru khusus untuk JSON
exports.getDataJSON = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM sow WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND (order_no ILIKE $1 OR ssbr_id ILIKE $1)`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY operation_no ASC';

    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

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
//============UPSERT EXCEL=============
// UPSERT berdasarkan ssbr_id dan operation_no
exports.upsert = async (req, res) => {
  try {
    console.log("=== UPSERT START ===");
    console.log("Body received:", JSON.stringify(req.body, null, 2));
    
    const { 
      ssbr_id,
      order_no,
      customer,
      location,
      part_name,
      model,
      part_number,
      created_by,
      type,
      group,
      category,
      operations
    } = req.body;

    // Validasi input
    if (!ssbr_id || !group || !operations || operations.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: ssbr_id, group, atau operations" 
      });
    }

    console.log("Validation passed");

    const results = [];

    // Loop setiap operation dan upsert
    for (let idx = 0; idx < operations.length; idx++) {
      const op = operations[idx];
      console.log(`Processing operation ${idx + 1}/${operations.length}:`, op.operation_no);
      
      // Check apakah data sudah ada berdasarkan ssbr_id + group + operation_no
      // PERBAIKAN: Pakai "group" dengan double quotes karena reserved keyword
      const checkQuery = `
        SELECT idsow FROM sow 
        WHERE ssbr_id = $1 AND "group" = $2 AND operation_no = $3
      `;
      
      console.log("Check query params:", [ssbr_id, group, op.operation_no]);
      const existing = await db.query(checkQuery, [ssbr_id, group, op.operation_no]);
      console.log("Existing rows found:", existing.rows.length);

      let result;
      
      if (existing.rows.length > 0) {
        console.log("UPDATE mode for operation:", op.operation_no);
        // UPDATE jika sudah ada
        // PERBAIKAN: Semua kolom reserved keyword pakai double quotes
        const updateQuery = `
          UPDATE sow SET 
            order_no = $1,
            part_number = $2,
            part_name = $3,
            model = $4,
            customer = $5,
            location = $6,
            wct_group = $7,
            workcenter = $8,
            operationtext = $9,
            planhours = $10,
            remark = $11,
            weight = $12,
            created_by = $13,
            "type" = $14,
            category = $15
          WHERE ssbr_id = $16 AND "group" = $17 AND operation_no = $18
          RETURNING *, 'updated' as action
        `;
        
        result = await db.query(updateQuery, [
          order_no,
          part_number,
          part_name,
          model,
          customer,
          location,
          op.wct_group,
          op.workcenter,
          op.operationtext,
          op.planhours,
          op.remark,
          op.weight,
          created_by,
          type,
          category,
          ssbr_id,
          group,
          op.operation_no
        ]);
        console.log("UPDATE success for:", op.operation_no);
      } else {
        console.log("INSERT mode for operation:", op.operation_no);
        // CREATE jika belum ada
        // PERBAIKAN: Kolom "group" dan "type" pakai double quotes
        const insertQuery = `
          INSERT INTO sow (
            ssbr_id, "group", operation_no, order_no, part_number, 
            part_name, model, customer, location, wct_group, 
            workcenter, operationtext, planhours, remark, weight,
            created_by, "type", category
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *, 'created' as action
        `;
        
        result = await db.query(insertQuery, [
          ssbr_id,
          group,
          op.operation_no,
          order_no,
          part_number,
          part_name,
          model,
          customer,
          location,
          op.wct_group,
          op.workcenter,
          op.operationtext,
          op.planhours,
          op.remark,
          op.weight,
          created_by,
          type,
          category
        ]);
        console.log("INSERT success for:", op.operation_no);
      }

      results.push(result.rows[0]);
    }

    console.log("=== UPSERT SUCCESS ===");

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (err) {
    console.error('❌ UPSERT ERROR:', err);
    console.error('Error message:', err.message);
    console.error('Error detail:', err.detail);
    
    res.status(500).json({ 
      success: false,
      error: err.message,
      detail: err.detail || null
    });
  }
};



// GET BY GROUP & SSBR ID
exports.getBySSBRAndGroup = async (req, res) => {
  try {
    const { ssbr_id, group } = req.params;
    
    console.log("=== GET DATA START ===");
    console.log("Search params:", { ssbr_id, group });

    // Query untuk ambil semua operations berdasarkan ssbr_id dan group
    const query = `
      SELECT 
        ssbr_id,
        order_no,
        customer,
        location,
        part_name,
        model,
        part_number,
        created_by,
        "type",
        "group",
        category,
        operation_no,
        operationtext,
        wct_group,
        workcenter,
        planhours,
        remark,
        weight
      FROM sow 
      WHERE ssbr_id = $1 AND "group" = $2
      ORDER BY operation_no ASC
    `;
    
    const result = await db.query(query, [ssbr_id, group]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan"
      });
    }

    // Ambil data header dari row pertama (semua row punya header yang sama)
    const firstRow = result.rows[0];
    const header = {
      ssbr_id: firstRow.ssbr_id,
      order_no: firstRow.order_no,
      customer: firstRow.customer,
      location: firstRow.location,
      part_name: firstRow.part_name,
      model: firstRow.model,
      part_number: firstRow.part_number,
      created_by: firstRow.created_by,
      type: firstRow.type,
      group: firstRow.group,
      category: firstRow.category
    };

    // Ambil semua operations
    const operations = result.rows.map(row => ({
      operation_no: row.operation_no,
      operationtext: row.operationtext,
      wct_group: row.wct_group,
      workcenter: row.workcenter,
      planhours: row.planhours,
      remark: row.remark,
      weight: row.weight
    }));

    console.log("Data found:", result.rows.length, "operations");
    console.log("=== GET DATA SUCCESS ===");

    res.json({
      success: true,
      count: operations.length,
      header: header,
      operations: operations
    });

  } catch (err) {
    console.error('❌ GET DATA ERROR:', err);
    console.error('Error message:', err.message);
    
    res.status(500).json({ 
      success: false,
      error: err.message
    });
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

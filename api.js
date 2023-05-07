const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

const config = {
  host: '10.199.14.47',
  port: 1433,
  server: '10.199.14.47',
  user: 'integratif',
  password: 'G3rb4ng!',
  database: 'GATE_DEV',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  }
};

sql.connect(config, err => {
  if (err)
  {
    console.log(err);
  }
  else
  {
    console.log('Connected to SQL Server');
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));

app.get('/', (req, res) => {
  sql.query('SELECT * FROM kartu_akses', (err, result) => {
    if (err)
    {
        console.log(err);
    }
    else
    {
        res.send(result.recordsets)
    }
  });
});

app.post('/masuk', (req, res) => {

  let id_kartu = req.body.id_kartu
  let kartu_data = null
  let id_gate = null
  let id_scanned_gate = req.body.id_gate
  let card_status = 0

  sql.query(`SELECT is_aktif FROM kartu_akses WHERE id_kartu_akses = '${id_kartu}';`, (err, result) => {
    if (err) {
      res.send({ error: err })
    }
    else
    {
      console.log(result.recordset[0])
      if(result)
      {
        kartu_data = result.recordset[0]
      }
      sql.query(`SELECT * FROM register_gate WHERE id_register_gate = '${id_scanned_gate}';`, (err, result) => {
        if (err) {
          res.send({ error: err })
        }
        else if (result)
        {
          id_gate = result.recordset[0]
          sql.query(`SELECT * FROM kartu_akses WHERE id_kartu_akses = '${id_kartu}';`, (err, result) => {
            if (err) {
              res.status(404).json({ error: err })
              // res.send(err)
            }
            else if (kartu_data.is_aktif == null || kartu_data.is_aktif === 0 || !id_gate)
            {
              res.send("0")
            }
            else if (kartu_data.is_aktif === 1 && id_gate)
            {
              sql.query(`INSERT INTO log_masuk (id_kartu_akses, id_register_gate, date_time, is_valid) VALUES(${id_kartu}, ${id_scanned_gate}, GETDATE(), 1)`);
              res.send("1")
            }
          })
        }
        else if (!result)
        {
          res.status(404).json({ error: err })
        }
      })
    }
  })
})

app.post('/keluar', (req, res) => {

  let id_kartu = req.body.id_kartu
  let kartu_data = null
  let id_gate = null
  let id_scanned_gate = req.body.id_gate
  let card_status = 0

  sql.query(`SELECT is_aktif FROM kartu_akses WHERE id_kartu_akses = '${id_kartu}';`, (err, result) => {
    if (err) {
      res.send({ error: err })
    }
    else
    {
      console.log(result.recordset[0])
      if(result)
      {
        kartu_data = result.recordset[0]
      }
      sql.query(`SELECT * FROM register_gate WHERE id_register_gate = '${id_scanned_gate}';`, (err, result) => {
        if (err) {
          res.send({ error: err })
        }
        else if (result)
        {
          id_gate = result.recordset[0]
          sql.query(`SELECT * FROM kartu_akses WHERE id_kartu_akses = '${id_kartu}';`, (err, result) => {
            if (err) {
              res.status(404).json({ error: err })
              // res.send(err)
            }
            else if (kartu_data.is_aktif == null || kartu_data.is_aktif === 0 || !id_gate)
            {
              res.send("0")
            }
            else if (kartu_data.is_aktif === 1 && id_gate)
            {
              sql.query(`INSERT INTO log_keluar (id_kartu_akses, id_register_gate, date_time, is_valid) VALUES(${id_kartu}, ${id_scanned_gate}, GETDATE(), 1)`);
              res.send("1")
            }
          })
        }
        else if (!result)
        {
          res.status(404).json({ error: err })
        }
      })
    }
  })
})

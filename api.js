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
  let id_gate = null
  let id_scanned_gate = req.body.id_gate
  let card_status = 0

  sql.query(`SELECT is_aktif FROM kartu_akses WHERE id_kartu_akses = '${id_kartu}';`, (err, result) => {
    if (err) {
      res.send({ error: err })
    }
    else
    {
      card_status = result.recordset[0].is_aktif

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
            else if (card_status === 0 || !id_gate)
            {
              res.send("0")
            }
            else if (card_status === 1 && id_gate)
            {
              // sql.query(`UPDATE kartu_akses SET is_aktif = 1 WHERE id_kartu_akses = '${id}'`)
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

  let id = req.body.id
  let card_status = null

  sql.query(`SELECT is_aktif FROM kartu_akses WHERE id_kartu_akses = '${id}';`, (err, result) => {
    if (err) {
      res.send({ error: err })
    }
    else
    {
      card_status = result.recordset[0].is_aktif
      console.log(card_status)
      return;
    }
  })

  sql.query(`SELECT * FROM kartu_akses WHERE id_kartu_akses = '${id}';`, (err, result) => {
    if (err) {
      res.status(404).json({ error: err })
    }
    else if (card_status === 0)
    {
      res.status(404).json({ error: "Kartu tidak aktif" })
    }
    else
    {
      // sql.query(`UPDATE kartu_akses SET is_aktif = 0 WHERE id_kartu_akses = '${id}'`)
      res.send({
        message: "Silahkan keluar!"
      })
    }
  })
})

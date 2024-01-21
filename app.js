const express = require('express');
const mysql = require('mysql');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const app = express();

const connection = mysql.createConnection({
  host: 'mysql_server',
  user: 'user',
  password: 'secret',
  database: 'test_db',
});

connection.connect();
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
  )
`;

connection.query(createTableQuery, (error) => {
  if (error) throw error;
  console.log('Users table created or already exists');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/api/player/:name', async (req, res) => {
  try {
    const playerName = req.params.name;
    
    const response = await axios.get(`https://www.balldontlie.io/api/v1/players?search=${playerName}`);
    
    if (response.data.data.length > 0) {
      const playerId = response.data.data[0].id;
      
      res.json(response.data.data[0]);
    } else {
      res.status(404).json({ error: 'Player not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
} );

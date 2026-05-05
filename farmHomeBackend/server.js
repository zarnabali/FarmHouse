const express = require('express')
const mongoose = require('mongoose')
const http = require('http');
const WebSocket = require('ws');
const { Server } = require('socket.io');

const authRoute = require('./routes/auth');
const animalsRoute = require('./routes/animals');
const healthRecordsRoute = require('./routes/healthRecords');
const vaccinationsRoute = require('./routes/vaccinations');
const breedingRoute = require('./routes/breeding');
const maintenanceRoute = require('./routes/maintenance');
const incidentsRoute = require('./routes/incidents');
const productsRoute = require('./routes/products');
const farmhousesRoute = require('./routes/farmhouse');
const ordersRoute = require('./routes/orders');
const alertsRoute = require('./routes/alerts');
const dashboardRouter = require('./routes/dashboard');
const quotesRoute = require('./routes/quotes');
const farmhouseUsersRoute = require('./routes/farmhouseUsers');
const Alert = require('./models/Alert');
const Farmhouse = require('./models/Farmhouse');

const cors = require('cors');
require('dotenv').config()

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express()
app.use('/uploads', express.static('uploads'));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.t1ompdc.mongodb.net/${process.env.DATABASE_NAME}`, { useNewUrlParser: true })

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', ()=>{
    console.log("MongoDB Connection Successfull");
});

app.use(express.json());

app.use(cors({
  origin: '*'
}));

app.use('/auth', authRoute);
app.use('/animals', animalsRoute);
app.use('/health-records', healthRecordsRoute);
app.use('/vaccinations', vaccinationsRoute);
app.use('/breeding', breedingRoute);
app.use('/maintenance', maintenanceRoute);
app.use('/incidents', incidentsRoute);
app.use('/products', productsRoute);
app.use('/farmhouse', farmhousesRoute);
app.use('/orders', ordersRoute);
app.use('/alerts', alertsRoute);
app.use('/quotes', quotesRoute);
app.use('/farmhouse-users', farmhouseUsersRoute);
app.use('/', dashboardRouter);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Farm Home Backend API',
      version: '1.0.0',
      description: 'API documentation for Farm Home Backend',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'],
};
 
const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/status', (req, res)=> {
    res.status(200).json({
        status: 'Up',
        frontend: process.env.FRONT_END_URL
    })
})

// Helper: get filtered alerts for a user by role
async function getFilteredAlerts(role, userId) {
  let farmhouses = [];
  if (role === 'admin') {
    farmhouses = await Farmhouse.find({ admin: userId });
  } else if (role === 'manager') {
    farmhouses = await Farmhouse.find({ manager: userId });
  } else if (role === 'assistant') {
    farmhouses = await Farmhouse.find({ assistants: userId });
  }
  if (!farmhouses.length) return [];
  const farmhouseLocations = farmhouses.map(fh => fh.location).filter(Boolean);
  const alerts = await Alert.find();
  return alerts.filter(alert => farmhouseLocations.includes(alert.location));
}

const wss = new WebSocket.Server({ server });

wss.on('connection', async function connection(ws, req) {
  // Parse the URL to get role and userId
  const url = req.url;
  const match = url.match(/^\/alerts\/(admin|manager|assistant)\/(\w+)$/);
  if (!match) {
    ws.close();
    return;
  }
  const role = match[1];
  const userId = match[2];

  // Send initial alerts
  const sendAlerts = async () => {
    const filteredAlerts = await getFilteredAlerts(role, userId);
    ws.send(JSON.stringify(filteredAlerts));
  };
  await sendAlerts();

  // Listen for new alerts (using Mongoose change streams)
  const alertChangeStream = Alert.watch();
  alertChangeStream.on('change', async (change) => {
    if (change.operationType === 'insert' || change.operationType === 'update' || change.operationType === 'replace' || change.operationType === 'delete') {
      await sendAlerts();
    }
  });

  ws.on('close', () => {
    alertChangeStream.close();
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server & WebSocket running on port ${PORT}`));
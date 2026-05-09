const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Recruitment backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

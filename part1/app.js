import express from 'express';
import dogsRoutes from './routes/dogs.js';
import walkRequestsRoutes from './routes/walkRequests.js';
import walkersRoutes from './routes/walkers.js';
import { seedDatabase } from './seed.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Seed data
await seedDatabase();

// Routes
app.use(dogsRoutes);
app.use(walkRequestsRoutes);
app.use(walkersRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

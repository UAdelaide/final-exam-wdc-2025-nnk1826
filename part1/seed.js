import { pool } from './db.js';

export async function seedDatabase() {
    try {
        const conn = await pool.getConnection();

        // Clean up existing data (respect FK constraints)
        await conn.query(`DELETE FROM WalkRatings`);
        await conn.query(`DELETE FROM WalkApplications`);
        await conn.query(`DELETE FROM WalkRequests`);
        await conn.query(`DELETE FROM Dogs`);
        await conn.query(`DELETE FROM Users`);

        // Users
        await conn.query(`
      INSERT INTO Users (username, email, password_hash, role) VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner'),
      ('daveowner', 'dave@example.com', 'hashed321', 'owner'),
      ('emilywalker', 'emily@example.com', 'hashed654', 'walker')
    `);

        // Dogs
        await conn.query(`
      INSERT INTO Dogs (owner_id, name, size) VALUES
      ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
      ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
      ((SELECT user_id FROM Users WHERE username = 'daveowner'), 'Rocky', 'large'),
      ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Luna', 'medium'),
      ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Charlie', 'small')
    `);

        // WalkRequests
        await conn.query(`
      INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
      ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Rocky'), '2025-06-11 10:00:00', 60, 'Hillside Trail', 'completed'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Luna'), '2025-06-12 07:15:00', 20, 'City Center', 'completed'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Charlie'), '2025-06-13 18:00:00', 40, 'Riverwalk', 'cancelled')
    `);

        // WalkApplications
        await conn.query(`
      INSERT INTO WalkApplications (request_id, walker_id, status) VALUES
      ((SELECT request_id FROM WalkRequests WHERE dog_id = (SELECT dog_id FROM Dogs WHERE name = 'Max')), 
       (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'pending'),
       
      ((SELECT request_id FROM WalkRequests WHERE dog_id = (SELECT dog_id FROM Dogs WHERE name = 'Bella')), 
       (SELECT user_id FROM Users WHERE username = 'emilywalker'), 'accepted'),

      ((SELECT request_id FROM WalkRequests WHERE dog_id = (SELECT dog_id FROM Dogs WHERE name = 'Rocky')), 
       (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'accepted'),

      ((SELECT request_id FROM WalkRequests WHERE dog_id = (SELECT dog_id FROM Dogs WHERE name = 'Luna')), 
       (SELECT user_id FROM Users WHERE username = 'bobwalker'), 'accepted'),

      ((SELECT request_id FROM WalkRequests WHERE dog_id = (SELECT dog_id FROM Dogs WHERE name = 'Charlie')), 
       (SELECT user_id FROM Users WHERE username = 'emilywalker'), 'rejected')
    `);

        // WalkRatings
        await conn.query(`
      INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES
      (
        (SELECT request_id FROM WalkRequests WHERE dog_id = (SELECT dog_id FROM Dogs WHERE name = 'Rocky')),
        (SELECT user_id FROM Users WHERE username = 'bobwalker'),
        (SELECT owner_id FROM Dogs WHERE name = 'Rocky'),
        5,
        'Great walk!'
      ),
      (
        (SELECT request_id FROM WalkRequests WHERE dog_id = (SELECT dog_id FROM Dogs WHERE name = 'Luna')),
        (SELECT user_id FROM Users WHERE username = 'bobwalker'),
        (SELECT owner_id FROM Dogs WHERE name = 'Luna'),
        4,
        'Punctual and friendly'
      )
    `);

        console.log('✅ Database seeded with full test data.');
        conn.release();
    } catch (err) {
        console.error('❌ Error seeding database:', err);
    }
}

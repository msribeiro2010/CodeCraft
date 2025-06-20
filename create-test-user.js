import bcrypt from 'bcrypt';
import { Pool } from '@neondatabase/serverless';

async function createTestUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const result = await pool.query(`
      INSERT INTO users (username, email, password, "initialBalance", "overdraftLimit", "notificationsEnabled")
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING *
    `, ['teste', 'teste@teste.com', hashedPassword, '1000.00', '500.00', true]);

    if (result.rows.length > 0) {
      console.log('Usuário de teste criado:', result.rows[0]);
    } else {
      console.log('Usuário já existe');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    process.exit(1);
  }
}

createTestUser();
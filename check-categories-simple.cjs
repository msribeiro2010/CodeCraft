const { Pool } = require('pg');

// Usar a mesma URL do .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://marceloribeiro@localhost:5432/codecraft'
});

async function checkCategories() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Verificar se há usuários
    const usersResult = await pool.query('SELECT id, email FROM users LIMIT 5');
    console.log('Usuários encontrados:', usersResult.rows);
    
    // Verificar todas as categorias
    const categoriesResult = await pool.query('SELECT * FROM categories ORDER BY "userId", name');
    console.log('Categorias encontradas:', categoriesResult.rows);
    
    // Verificar categorias por usuário
    if (usersResult.rows.length > 0) {
      const userId = usersResult.rows[0].id;
      const userCategoriesResult = await pool.query('SELECT * FROM categories WHERE "userId" = $1', [userId]);
      console.log(`Categorias do usuário ${userId}:`, userCategoriesResult.rows);
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkCategories();
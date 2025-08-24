const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users } = require('./shared/schema');

require('dotenv').config();

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function checkUsers() {
  try {
    console.log('Verificando usuários no banco...');
    const allUsers = await db.select().from(users);
    console.log(`Total de usuários encontrados: ${allUsers.length}`);
    
    if (allUsers.length > 0) {
      console.log('Usuários:');
      allUsers.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}, Username: ${user.username}`);
      });
    } else {
      console.log('Nenhum usuário encontrado no banco de dados.');
    }
  } catch (error) {
    console.error('Erro ao verificar usuários:', error);
  } finally {
    await client.end();
  }
}

checkUsers();
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const { users, categories, transactions } = require('./shared/schema');

require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });
const db = drizzle(client);

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const [testUser] = await db.insert(users).values({
      username: 'usuario_teste',
      email: 'teste@exemplo.com',
      password: hashedPassword,
      initialBalance: '1000.00',
      overdraftLimit: '500.00',
      notificationsEnabled: true
    }).returning();

    console.log('✅ Usuário de teste criado:', testUser.email);

    // Criar categorias padrão
    const defaultCategories = [
      'Alimentação',
      'Transporte',
      'Moradia',
      'Saúde',
      'Educação',
      'Lazer',
      'Compras',
      'Salário',
      'Freelance',
      'Investimentos',
      'Outros'
    ];

    const categoryPromises = defaultCategories.map(name => 
      db.insert(categories).values({
        name,
        userId: testUser.id
      }).returning()
    );

    const createdCategories = await Promise.all(categoryPromises);
    console.log(`✅ ${createdCategories.length} categorias criadas`);

    // Criar algumas transações de exemplo
    const sampleTransactions = [
      {
        userId: testUser.id,
        type: 'RECEITA',
        amount: '3000.00',
        date: new Date('2024-01-01'),
        categoryId: createdCategories.find(c => c[0].name === 'Salário')[0].id,
        description: 'Salário Janeiro',
        status: 'PAGO'
      },
      {
        userId: testUser.id,
        type: 'DESPESA',
        amount: '800.00',
        date: new Date('2024-01-05'),
        categoryId: createdCategories.find(c => c[0].name === 'Moradia')[0].id,
        description: 'Aluguel Janeiro',
        status: 'PAGO'
      },
      {
        userId: testUser.id,
        type: 'DESPESA',
        amount: '200.00',
        date: new Date('2024-01-10'),
        categoryId: createdCategories.find(c => c[0].name === 'Alimentação')[0].id,
        description: 'Supermercado',
        status: 'PAGO'
      },
      {
        userId: testUser.id,
        type: 'DESPESA',
        amount: '150.00',
        date: new Date('2024-01-15'),
        categoryId: createdCategories.find(c => c[0].name === 'Transporte')[0].id,
        description: 'Combustível',
        status: 'A_VENCER'
      }
    ];

    const transactionPromises = sampleTransactions.map(transaction => 
      db.insert(transactions).values(transaction).returning()
    );

    const createdTransactions = await Promise.all(transactionPromises);
    console.log(`✅ ${createdTransactions.length} transações de exemplo criadas`);

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Dados criados:');
    console.log(`   👤 Usuário: ${testUser.email} (senha: 123456)`);
    console.log(`   📁 Categorias: ${createdCategories.length}`);
    console.log(`   💰 Transações: ${createdTransactions.length}`);
    console.log('\n🚀 Você pode fazer login com:');
    console.log('   Email: teste@exemplo.com');
    console.log('   Senha: 123456');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

seed();
const postgres = require('postgres');
const bcrypt = require('bcryptjs');

require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const userResult = await client`
      INSERT INTO users (username, email, password, initial_balance, overdraft_limit, notifications_enabled)
      VALUES ('usuario_teste', 'teste@exemplo.com', ${hashedPassword}, 1000.00, 500.00, true)
      RETURNING id, email
    `;

    const testUser = userResult[0];
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

    const categoryResults = [];
    for (const categoryName of defaultCategories) {
      const result = await client`
        INSERT INTO categories (name, user_id)
        VALUES (${categoryName}, ${testUser.id})
        RETURNING id, name
      `;
      categoryResults.push(result[0]);
    }

    console.log(`✅ ${categoryResults.length} categorias criadas`);

    // Encontrar IDs das categorias
    const salarioCategory = categoryResults.find(c => c.name === 'Salário');
    const moradiaCategory = categoryResults.find(c => c.name === 'Moradia');
    const alimentacaoCategory = categoryResults.find(c => c.name === 'Alimentação');
    const transporteCategory = categoryResults.find(c => c.name === 'Transporte');

    // Criar algumas transações de exemplo
    const sampleTransactions = [
      {
        userId: testUser.id,
        type: 'RECEITA',
        amount: 3000.00,
        date: '2024-01-01',
        categoryId: salarioCategory.id,
        description: 'Salário Janeiro',
        status: 'PAGO'
      },
      {
        userId: testUser.id,
        type: 'DESPESA',
        amount: 800.00,
        date: '2024-01-05',
        categoryId: moradiaCategory.id,
        description: 'Aluguel Janeiro',
        status: 'PAGO'
      },
      {
        userId: testUser.id,
        type: 'DESPESA',
        amount: 200.00,
        date: '2024-01-10',
        categoryId: alimentacaoCategory.id,
        description: 'Supermercado',
        status: 'PAGO'
      },
      {
        userId: testUser.id,
        type: 'DESPESA',
        amount: 150.00,
        date: '2024-01-15',
        categoryId: transporteCategory.id,
        description: 'Combustível',
        status: 'A_VENCER'
      }
    ];

    let transactionCount = 0;
    for (const transaction of sampleTransactions) {
      await client`
        INSERT INTO transactions (user_id, type, amount, date, category_id, description, status)
        VALUES (
          ${transaction.userId},
          ${transaction.type},
          ${transaction.amount},
          ${transaction.date},
          ${transaction.categoryId},
          ${transaction.description},
          ${transaction.status}
        )
      `;
      transactionCount++;
    }

    console.log(`✅ ${transactionCount} transações de exemplo criadas`);

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Dados criados:');
    console.log(`   👤 Usuário: ${testUser.email} (senha: 123456)`);
    console.log(`   📁 Categorias: ${categoryResults.length}`);
    console.log(`   💰 Transações: ${transactionCount}`);
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
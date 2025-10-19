import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new Database('./test.db');

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco SQLite...');

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password, initial_balance, overdraft_limit, notifications_enabled)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const userResult = insertUser.run('usuario_teste', 'teste@exemplo.com', hashedPassword, 1000.00, 500.00, 1);
    const testUserId = userResult.lastInsertRowid;
    
    console.log('✅ Usuário de teste criado: teste@exemplo.com');

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

    const insertCategory = db.prepare(`
      INSERT INTO categories (name, user_id)
      VALUES (?, ?)
    `);

    const categoryIds = {};
    for (const categoryName of defaultCategories) {
      const result = insertCategory.run(categoryName, testUserId);
      categoryIds[categoryName] = result.lastInsertRowid;
    }

    console.log(`✅ ${defaultCategories.length} categorias criadas`);

    // Criar algumas transações de exemplo
    const sampleTransactions = [
      {
        userId: testUserId,
        type: 'RECEITA',
        amount: 3000.00,
        date: '2024-01-01',
        categoryId: categoryIds['Salário'],
        description: 'Salário Janeiro',
        status: 'PAGO'
      },
      {
        userId: testUserId,
        type: 'DESPESA',
        amount: 800.00,
        date: '2024-01-05',
        categoryId: categoryIds['Moradia'],
        description: 'Aluguel Janeiro',
        status: 'PAGO'
      },
      {
        userId: testUserId,
        type: 'DESPESA',
        amount: 200.00,
        date: '2024-01-10',
        categoryId: categoryIds['Alimentação'],
        description: 'Supermercado',
        status: 'PAGO'
      },
      {
        userId: testUserId,
        type: 'DESPESA',
        amount: 150.00,
        date: '2024-01-15',
        categoryId: categoryIds['Transporte'],
        description: 'Combustível',
        status: 'A_VENCER'
      },
      {
        userId: testUserId,
        type: 'RECEITA',
        amount: 500.00,
        date: '2024-01-20',
        categoryId: categoryIds['Freelance'],
        description: 'Projeto freelance',
        status: 'PAGO'
      }
    ];

    const insertTransaction = db.prepare(`
      INSERT INTO transactions (user_id, type, amount, date, category_id, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    let transactionCount = 0;
    for (const transaction of sampleTransactions) {
      insertTransaction.run(
        transaction.userId,
        transaction.type,
        transaction.amount,
        transaction.date,
        transaction.categoryId,
        transaction.description,
        transaction.status
      );
      transactionCount++;
    }

    console.log(`✅ ${transactionCount} transações de exemplo criadas`);

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Dados criados:');
    console.log(`   👤 Usuário: teste@exemplo.com (senha: 123456)`);
    console.log(`   📁 Categorias: ${defaultCategories.length}`);
    console.log(`   💰 Transações: ${transactionCount}`);
    console.log('\n🚀 Você pode fazer login com:');
    console.log('   Email: teste@exemplo.com');
    console.log('   Senha: 123456');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  } finally {
    db.close();
    process.exit(0);
  }
}

seed();
import Database from 'better-sqlite3';

const db = new Database('./test.db');

console.log('🔄 Adicionando campos de recorrência...');

try {
  // Adicionar novos campos à tabela transactions
  db.exec(`
    ALTER TABLE transactions ADD COLUMN is_recurring INTEGER DEFAULT 0 NOT NULL;
  `);
  console.log('✅ Campo is_recurring adicionado');

  db.exec(`
    ALTER TABLE transactions ADD COLUMN recurrence_type TEXT;
  `);
  console.log('✅ Campo recurrence_type adicionado');

  db.exec(`
    ALTER TABLE transactions ADD COLUMN total_installments INTEGER;
  `);
  console.log('✅ Campo total_installments adicionado');

  db.exec(`
    ALTER TABLE transactions ADD COLUMN current_installment INTEGER;
  `);
  console.log('✅ Campo current_installment adicionado');

  db.exec(`
    ALTER TABLE transactions ADD COLUMN recurring_group_id TEXT;
  `);
  console.log('✅ Campo recurring_group_id adicionado');

  console.log('\n✅ Migração concluída com sucesso!');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('⚠️  Colunas já existem, migração não necessária');
  } else {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
} finally {
  db.close();
}

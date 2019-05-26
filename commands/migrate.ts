import chalk from 'chalk';
import database from './database';

const handleError = (error) => {
  console.error(error);
  process.exit(1);
};

const run = async () => {
  const log = console.log;

  // Status logging to print out the amount of factories and seeds.
  log('🔎 ', chalk.green.underline.bold('Run migrations'));

  // Get database connection and pass it to the seeder
  try {
    await database.sync({ force: true });
  } catch (error) {
    return handleError(error);
  }

  log('\n👍 ', chalk.green.underline('Database Migrate Finished'));

  return;
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch(console.log);

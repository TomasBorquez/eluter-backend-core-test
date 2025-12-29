import postgres from 'postgres';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

declare global {
  var __TESTCONTAINER__: StartedPostgreSqlContainer;
  var __DB__: postgres.Sql;
  var db: postgres.Sql;
  var container: StartedPostgreSqlContainer;
}

export {};

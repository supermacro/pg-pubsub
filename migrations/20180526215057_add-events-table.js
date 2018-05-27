
exports.up = async (knex, Promise) =>
  knex.raw(`
    CREATE TYPE channel_tags AS ENUM ('email', 'instant_messaging', 'sms');

    CREATE TABLE IF NOT EXISTS db_events (
      id serial PRIMARY KEY,
      channel channel_tags NOT NULL,
      payload jsonb NOT NULL
    );

    CREATE OR REPLACE FUNCTION notify_trigger() RETURNS trigger AS $$
    DECLARE
    BEGIN
      PERFORM pg_notify('pub_sub', row_to_json(NEW)::text);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER db_events_insert
      AFTER INSERT ON db_events
      FOR EACH ROW
      EXECUTE PROCEDURE notify_trigger();
  `)

exports.down = async (knex, Promise) =>
  knex.raw(`
    DROP TYPE IF EXISTS channel_tags;

    DROP TABLE IF EXISTS db_events;

    DROP FUNCTION IF EXISTS notify_trigger();

    DROP TRIGGER IF EXISTS db_events_notify_update ON db_events;
  `)

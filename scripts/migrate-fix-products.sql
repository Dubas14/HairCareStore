ALTER TABLE products_rels ADD COLUMN IF NOT EXISTS ingredients_id integer;
CREATE TABLE IF NOT EXISTS products_locales (
  id serial PRIMARY KEY,
  _parent_id integer REFERENCES products(id) ON DELETE CASCADE,
  title varchar,
  subtitle varchar,
  description text,
  _locale varchar NOT NULL
);

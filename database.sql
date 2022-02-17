CREATE DATABASE perntodo;

CREATE TABLE todo(
    todo_id SERIAL PRIMARY KEY,
    description VARCHAR(255)
);

ALTER TABLE todo ADD COLUMN user_id integer REFERENCES users;

ALTER TABLE todo ADD FOREIGN KEY (user_id)
  REFERENCES users;

ALTER TABLE todo DROP COLUMN user_id;

ALTER TABLE todo ALTER COLUMN user_id SET NOT NULL;

ALTER TABLE todo DROP CONSTRAINT todo_user_id_fkey1;

UPDATE todo SET user_id = 3;

ALTER TABLE todo ADD CHECK (description <> '');
ALTER TABLE users ADD CHECK (length(email) > 1);

ALTER TABLE todo ADD FOREIGN KEY (user_id)
  REFERENCES users ON DELETE CASCADE;
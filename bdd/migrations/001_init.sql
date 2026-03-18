-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enums
CREATE TYPE role AS ENUM ('USER', 'ADMIN');
CREATE TYPE provider AS ENUM ('LOCAL', 'GOOGLE', 'APPLE', 'FACEBOOK');
CREATE TYPE event_visibility AS ENUM ('PUBLIC', 'PRIVATE');
CREATE TYPE invitation_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');
CREATE TYPE event_category AS ENUM ('SPORT', 'MUSIC', 'FOOD', 'PARTY', 'ART', 'OTHER');

-- Table users
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email        TEXT UNIQUE NOT NULL,
  password     TEXT,
  name         TEXT NOT NULL,
  avatar       TEXT,
  role         role NOT NULL DEFAULT 'USER',
  provider     provider NOT NULL DEFAULT 'LOCAL',
  provider_id  TEXT,
  refresh_token TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_provider_id ON users (provider_id);

-- Table events
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,
  address     TEXT,
  location    geometry(Point, 4326) NOT NULL,
  capacity    INTEGER NOT NULL,
  visibility  event_visibility NOT NULL DEFAULT 'PUBLIC',
  category    event_category NOT NULL DEFAULT 'OTHER',
  start_at    TIMESTAMPTZ NOT NULL,
  end_at      TIMESTAMPTZ NOT NULL,
  creator_id  UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_creator_end ON events (creator_id, end_at);
CREATE INDEX idx_events_start_at ON events (start_at);
CREATE INDEX idx_events_end_at ON events (end_at) WHERE visibility = 'PUBLIC';
CREATE INDEX idx_events_category_end ON events (category, end_at) WHERE visibility = 'PUBLIC';
CREATE INDEX idx_events_location ON events USING GIST (location) WHERE visibility = 'PUBLIC';

-- Table messages
CREATE TABLE messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content    TEXT NOT NULL,
  event_id   UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_event_created ON messages (event_id, created_at);

-- Table places_of_interest
CREATE TABLE places_of_interest (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  location    geometry(Point, 4326) NOT NULL,
  icon        TEXT,
  user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_poi_user_id ON places_of_interest (user_id);
CREATE INDEX idx_poi_location ON places_of_interest USING GIST (location);

-- Table participations
CREATE TABLE participations (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  event_id  UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id)
);

CREATE INDEX idx_participations_event ON participations (event_id);

-- Table invitations
CREATE TABLE invitations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status          invitation_status NOT NULL DEFAULT 'PENDING',
  event_id        UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  invited_by_id   UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, invited_user_id)
);

CREATE INDEX idx_invitations_invited_user ON invitations (invited_user_id);
CREATE INDEX idx_invitations_invited_by   ON invitations (invited_by_id);
CREATE INDEX idx_invitations_event_status ON invitations (event_id, status);

-- Trigger updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at         BEFORE UPDATE ON users              FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_events_updated_at        BEFORE UPDATE ON events             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_messages_updated_at      BEFORE UPDATE ON messages           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_poi_updated_at           BEFORE UPDATE ON places_of_interest FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invitations_updated_at   BEFORE UPDATE ON invitations        FOR EACH ROW EXECUTE FUNCTION update_updated_at();

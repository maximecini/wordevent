-- Index GIST PostGIS sur events.location
CREATE INDEX events_location_gist_idx ON events USING GIST (location);

-- Index GIST PostGIS sur places_of_interest.location
CREATE INDEX places_location_gist_idx ON places_of_interest USING GIST (location);
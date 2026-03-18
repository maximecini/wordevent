const REQUIRED_VARS = [
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'GOOGLE_CLIENT_ID',
  'APPLE_CLIENT_ID',
  'APPLE_TEAM_ID',
  'APPLE_KEY_ID',
  'APPLE_PRIVATE_KEY',
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
] as const;

/**
 * Valide la présence de toutes les variables d'environnement requises.
 * Doit être appelé au démarrage de l'application, avant NestFactory.create().
 *
 * @throws Error si une ou plusieurs variables sont manquantes
 */
export function validateEnv(): void {
  const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Variables d'environnement manquantes : ${missing.join(', ')}`,
    );
  }
}

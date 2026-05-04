import { initializeApp, getApps, cert, applicationDefault, type App } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

let app: App | null = null;

/**
 * Inicializa o Firebase Admin SDK.
 *
 * - Em Cloud Run: usa Application Default Credentials da service account anexada.
 * - Em dev local: usa GOOGLE_APPLICATION_CREDENTIALS apontando para JSON.
 */
export function getAdminApp(): App {
  if (app) return app;
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }
  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  app = initializeApp({
    credential: credentialPath ? cert(credentialPath) : applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  return app;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}

/**
 * Valida o ID token do Firebase enviado pelo cliente.
 * Lança se inválido. Retorna claims decodificados (uid, email, etc.).
 */
export async function verifyIdToken(token: string): Promise<DecodedIdToken> {
  return getAdminAuth().verifyIdToken(token, true /* checkRevoked */);
}

export async function setUserClaims(uid: string, claims: Record<string, unknown>) {
  return getAdminAuth().setCustomUserClaims(uid, claims);
}

export async function disableUser(uid: string) {
  return getAdminAuth().updateUser(uid, { disabled: true });
}

export type { DecodedIdToken };

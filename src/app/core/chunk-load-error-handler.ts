import { ErrorHandler, Injectable } from '@angular/core';

/**
 * TC-008 (#195): recuperacion automatica cuando un chunk lazy-loaded del bundle
 * ya no existe en el servidor (deploy nuevo re-genera hashes) y el navegador
 * tiene main.js cacheado apuntando al hash viejo.
 *
 * Sintomas: `Failed to fetch dynamically imported module`, `ChunkLoadError`,
 * `Loading chunk X failed`. Sin este handler el usuario queda clavado sin
 * navegacion posible; con `location.reload()` fuerza recarga de index.html y
 * su main.js apunta a los chunks del deploy vigente.
 *
 * Guard `chunkReloadInProgress` en sessionStorage: evita loop infinito si el
 * reload no soluciona el problema (bug real, no cache stale).
 */
@Injectable({ providedIn: 'root' })
export class ChunkLoadErrorHandler implements ErrorHandler {
  private static readonly RELOAD_FLAG = 'chunkReloadInProgress';

  handleError(error: unknown): void {
    const message = this.extractMessage(error);

    if (this.isChunkLoadError(message)) {
      const alreadyReloaded = sessionStorage.getItem(ChunkLoadErrorHandler.RELOAD_FLAG);
      if (!alreadyReloaded) {
        sessionStorage.setItem(ChunkLoadErrorHandler.RELOAD_FLAG, '1');
        window.location.reload();
        return;
      }
      console.error('ChunkLoadError persistio despues de reload — no es cache stale:', error);
      sessionStorage.removeItem(ChunkLoadErrorHandler.RELOAD_FLAG);
    } else {
      sessionStorage.removeItem(ChunkLoadErrorHandler.RELOAD_FLAG);
    }

    console.error(error);
  }

  private extractMessage(error: unknown): string {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    const anyError = error as { message?: unknown; toString?: () => string };
    if (typeof anyError.message === 'string') return anyError.message;
    return String(error);
  }

  private isChunkLoadError(message: string): boolean {
    if (!message) return false;
    return (
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('error loading dynamically imported module') ||
      /Loading chunk .+ failed/i.test(message) ||
      message.includes('ChunkLoadError')
    );
  }
}

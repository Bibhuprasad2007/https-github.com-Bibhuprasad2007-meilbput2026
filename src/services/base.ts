/**
 * Custom error thrown when a service method is called without an active backend connection.
 */
export class BackendNotConnectedError extends Error {
  public readonly code: string = 'BACKEND_NOT_CONNECTED';

  constructor(
    message: string = 'Backend connection is required to perform this action. Integration will be configured in subsequent phases.'
  ) {
    super(message);
    this.name = 'BackendNotConnectedError';
    Object.setPrototypeOf(this, BackendNotConnectedError.prototype);
  }
}

/**
 * Utility helper to assert backend connectivity before executing data mutations.
 */
export function assertBackendConnected(actionName: string): never {
  throw new BackendNotConnectedError(
    `Backend connection is required to ${actionName}. No external services are currently connected.`
  );
}

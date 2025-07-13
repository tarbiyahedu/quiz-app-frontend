declare global {
  interface Window {
    google?: {
      auth2: {
        getAuthInstance(): {
          signIn(): Promise<{
            getAuthResponse(): {
              id_token: string;
            };
          }>;
        };
      };
    };
  }
}

export {}; 
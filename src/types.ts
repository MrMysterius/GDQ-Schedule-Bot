export interface credentialsObject {
  installed: {
    client_id: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
    redirect_uris: Array<string>;
  };
}

export interface config {
  schedule_url: string;
  calendar_id: string;
}

export interface scraper_rawEvent {}

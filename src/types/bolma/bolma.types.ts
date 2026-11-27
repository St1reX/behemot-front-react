export interface BolmaIntegration {
  id: 'bolma'
  name: string
  engine: string
  isConfigured: boolean
  sslEnabled: boolean
}

export interface BolmaStatusResponse {
  status: 'ok' | 'error'
  components: {
    database: 'ok' | 'error'
  }
}

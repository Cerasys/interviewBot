export interface ObservabilityConfig {
    connectionString: string
}

export interface RecallConfig {
    apiKey: string
}

export interface DatabaseConfig {
    connectionString: string
}

export interface AppConfig {
    observability: ObservabilityConfig
    database: DatabaseConfig
}

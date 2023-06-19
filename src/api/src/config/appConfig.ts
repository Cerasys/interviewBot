export interface ObservabilityConfig {
    connectionString: string
    roleName: string
}

export interface RecallConfig {
    apiKey: string
}

export interface DatabaseConfig {
    connectionString: string
    databaseName: string
}

export interface AppConfig {
    observability: ObservabilityConfig
    database: DatabaseConfig
}

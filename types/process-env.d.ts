declare namespace NodeJS {
    export interface ProcessEnv {
        USERS: string;
        MASTER_PASSWORD: string;
        ASTRA_DB_ID: string;
        ASTRA_DB_REGION: string;
        ASTRA_DB_KEYSPACE: string;
        ASTRA_DB_TOKEN: string;
    }
}
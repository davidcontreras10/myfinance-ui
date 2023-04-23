export interface ApiCredentials {
    username: string,
    password: string
}

export interface TokenResponse {
    accessToken: string,
    expiresIn: number
}

export interface StoredToken {
    accessToken: string,
    expireDate: Date
}
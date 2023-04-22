export interface ApiCredentials{
    username: string,
    password: string
}

export interface TokenResponse{
    accessToken: string,
    expiresIn: number
}
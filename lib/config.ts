const config = {
    env : {
        databaseUrl: process.env.DATABASE_URL,
        upstash:{
            redisUrl: process.env.UPSTASH_REDIS_URL,
            redisToken: process.env.UPSTASH_REDIS_TOKEN,
            qstashUrl: process.env.QSTASH_URL,
            qstashToken: process.env.QSTASH_TOKEN
        }
    }
}

export default config
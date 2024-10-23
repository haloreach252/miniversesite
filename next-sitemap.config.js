module.exports = {
    siteUrl: 'https://miniversestudios.com',
    generateRobotsTxt: true,
    exclude: ['/admin/*', '/api/*'],
    robotsTxtOptions: {
        policies: [
            { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/']},
            { userAgent: 'Googlebot', allow: '/' }
        ]
    }
}
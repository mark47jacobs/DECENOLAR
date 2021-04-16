let config = {
    development: {
        name: 'development',
        httpPort: 8080,
        httpsPort: 443,
        database: 'mongodb+srv://main-user:main-user@cluster0.ylcda.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    }
};
let envToExport = config.development;
module.exports = envToExport;
//# sourceMappingURL=config.js.map
module.exports = function attachHandlers (server) {
    // require('./user')(server);
    // require('./auth')(server);
    require('./site')(server);
};
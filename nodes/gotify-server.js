module.exports = function(RED) {
  function GotifyServer(config) {
    RED.nodes.createNode(this, config)
    this.endpointUrl = new URL(config.url)
    this.endpointUrl.pathname = "message"
    this.endpointUrl.searchParams.set("token", this.credentials.apiKey)
  }

  RED.nodes.registerType("gotify-server", GotifyServer, {
    credentials: {
      apiKey: { type: "password" }
    }
  });
}
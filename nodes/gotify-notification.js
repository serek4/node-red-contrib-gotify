module.exports = function (RED) {
  const http = require('node:http')

  function NotificationNode(config) {
    RED.nodes.createNode(this, config);

    this.on('input', function (msg, send, done) {
      const {
        title,
        payload: message,
        priority,
        extras
      } = msg

      this.server = RED.nodes.getNode(config.server)
      if (!this.server) {
        return
      }

      this.status({
        fill: "blue",
        shape: "dot",
        text: "sending"
      });

      const formData = {
        title: title || '',
        message: message || '',
        priority: priority || 5,
      }

      if (extras) {
        formData.extras = extras
      }

      const postData = JSON.stringify(formData);
      const options = {
        method: "POST",
        timeout: 5000,
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData)
        }
      };

      let responseData = new String();
      const req = http.request(this.server.endpointUrl.href, options, (res) => {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          responseData += chunk;
        });
        res.on("end", () => {
          if (res.statusCode == 200) {
            this.status({
              fill: "green",
              shape: "dot",
              text: "success"
            });
          } else {
            this.status({
              fill: "yellow",
              shape: "dot",
              text: `${res.statusMessage} (${res.statusCode})`
            });
          }
        });
      });

      req.on("timeout", () => {
        req.destroy();
      });
      req.on("error", (e) => {
        responseData = e;
        this.status({
          fill: "red",
          shape: "ring",
          text: e.message
        });
      });
      req.on("close", () => {
        done();
      });

      req.write(postData);
      req.end();
    });
  }

  RED.nodes.registerType("gotify-notification", NotificationNode);
}

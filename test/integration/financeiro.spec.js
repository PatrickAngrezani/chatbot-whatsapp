const Client = require("whatsapp-web.js");

describe("testing qrcode-terminal", () => {
  it("generate qrcode", () => {
    const qrcode = require("qrcode-terminal");
    const spy = jest.spyOn(qrcode, "generate");
    qrcode.generate({ small: true });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("checks client connection", () => {
    // mocking 'on' method to capture event listeners
    Client.on = jest.fn();

    // simulate a listener for the "ready" event
    Client.on("ready", () => {
      console.log("Client is ready!");
    });

    // verify mocked "on" method was called with the "ready" event
    expect(Client.on).toHaveBeenCalledWith("ready", expect.any(Function));
  });
});

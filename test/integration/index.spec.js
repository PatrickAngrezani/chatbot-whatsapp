describe("testing qrcode-terminal", () => {
  it("generate qrcode", () => {
    const qrcode = require("qrcode-terminal");
    const spy = jest.spyOn(qrcode, "generate");
    qrcode.generate({ small: true });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

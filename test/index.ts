import { xApp } from "../src/index";

describe(`Tests: TODO`, () => {
  const sdk = new xApp();

  sdk.on("payload", (data) => {
    console.log(data.reason === "DECLINED");
  });

  describe("TODO", () => {
    it(`'TODO`, async () => {
      expect(1).toEqual(1);
    });
  });
});

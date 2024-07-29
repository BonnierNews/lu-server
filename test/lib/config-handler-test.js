import { expect } from "chai";

import validateConfig from "../../lib/configValidator.js";

describe("Config validator", () => {
  it("should not return anything", () => {
    const config = {
      envName: "test",
      logClientIp: true,
      express: { body: { limit: "200kb" } },
    };
    should.not.exist(validateConfig(config));
  });

  it("should throw error", () => {
    const config = {
      envName: "test",
      logClientIp: true,
      express: { body: { limit: "REPLACED_BY_ENV" } },
    };
    expect(() => validateConfig(config)).to.throw("Invalid config for keys: express.body.limit");
  });

  it("should throw error", () => {
    const config = {
      envName: "test",
      logClientIp: "REPLACED_BY_ENV",
      express: { body: { limit: "REPLACED_BY_ENV" } },
    };
    expect(() => validateConfig(config)).to.throw("Invalid config for keys: logClientIp, express.body.limit");
  });
});

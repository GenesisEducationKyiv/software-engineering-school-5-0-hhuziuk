import { TokenService } from "../../application/services/token.service";
import { v4 as uuidv4 } from "uuid";

jest.mock("uuid");
jest.mock("../../../../shared/configs/config", () => ({
  config: {
    app: { baseUrl: "https://example.com" },
  },
}));

describe("TokenService", () => {
  let service: TokenService;

  beforeEach(() => {
    service = new TokenService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("generate() should return a UUID v4", () => {
    (uuidv4 as jest.Mock).mockReturnValue("fixed-uuid-1234");
    const token = service.generate();
    expect(uuidv4).toHaveBeenCalled();
    expect(token).toBe("fixed-uuid-1234");
  });

  it("getConfirmUrl() should build correct confirmation URL", () => {
    const url = service.getConfirmUrl("token-xyz");
    expect(url).toBe("https://example.com/api/confirm/token-xyz");
  });

  it("getUnsubscribeUrl() should build correct unsubscribe URL", () => {
    const url = service.getUnsubscribeUrl("token-abc");
    expect(url).toBe("https://example.com/api/unsubscribe/token-abc");
  });
});

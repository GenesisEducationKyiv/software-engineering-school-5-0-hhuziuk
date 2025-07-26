import { NotificationService } from "../../application/services/notification.service";
import { UpdateFrequency } from "../../../../shared/enums/frequency.enum";
import { NotificationBatchSender } from "../../application/services/notification-batch-sender";

jest.mock("../../../../shared/configs/config", () => ({
  config: {
    app: {
      baseUrl: "http://mock-url.com",
    },
  },
}));

describe("NotificationService", () => {
  let service: NotificationService;
  let batchSender: jest.Mocked<NotificationBatchSender>;

  beforeEach(() => {
    batchSender = {
      send: jest.fn().mockResolvedValue(undefined),
    } as any;
    service = new NotificationService(batchSender);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delegate sendBatch to batchSender.send with correct frequency", async () => {
    await service.sendBatch(UpdateFrequency.DAILY);
    expect(batchSender.send).toHaveBeenCalledTimes(1);
    expect(batchSender.send).toHaveBeenCalledWith(UpdateFrequency.DAILY);

    await service.sendBatch(UpdateFrequency.HOURLY);
    expect(batchSender.send).toHaveBeenCalledWith(UpdateFrequency.HOURLY);
    expect(batchSender.send).toHaveBeenCalledTimes(2);
  });

  it("should propagate errors from batchSender.send", async () => {
    const error = new Error("failure");
    batchSender.send.mockRejectedValueOnce(error);
    await expect(service.sendBatch(UpdateFrequency.DAILY)).rejects.toThrow("failure");
  });
});

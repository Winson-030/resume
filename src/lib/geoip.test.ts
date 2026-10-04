import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearCache } from "./cache";
import { detectCountryFromIP } from "./geoip";

function requestFrom(ip: string): Request {
  return new Request("https://www.winson.dev/", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("detectCountryFromIP", () => {
  beforeEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    clearCache();
    vi.restoreAllMocks();
  });

  it("resolves a country via lookup and then serves it from cache", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ country_code: "JP" }), { status: 200 })
      );

    await expect(detectCountryFromIP(requestFrom("8.8.8.8"))).resolves.toBe("JP");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Second call must not hit the network: the country is cached by IP.
    fetchMock.mockRejectedValue(new Error("network should not be used"));
    await expect(detectCountryFromIP(requestFrom("8.8.8.8"))).resolves.toBe("JP");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("skips internal IPs without a lookup", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("no network expected"));

    await expect(detectCountryFromIP(requestFrom("127.0.0.1"))).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

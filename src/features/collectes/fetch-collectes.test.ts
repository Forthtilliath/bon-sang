import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchCollectesByCity } from "./fetch-collectes";

type Handler = (url: string) => { ok: boolean; body: unknown } | "throw" | "bad-json";

function mockFetch(handler: Handler) {
  const fetchMock = vi.fn(async (input: string | URL, _init?: RequestInit) => {
    const url = String(input);
    const result = handler(url);
    if (result === "throw") throw new Error("network down");
    if (result === "bad-json") {
      return { ok: true, json: async () => Promise.reject(new SyntaxError("Unexpected token")) };
    }
    return { ok: result.ok, json: async () => result.body };
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const CITY = { nom: "Toulouse", lat: 43.6, lon: 1.44 };
const FIXED_SITE = {
  samplingLocationEntities_SF: [
    {
      name: "Maison du don",
      city: "Toulouse",
      postCode: "31000",
      latitude: 43.6,
      longitude: 1.44,
      giveBlood: 1,
    },
  ],
};

const isGeocode = (url: string) => url.includes("/city/searchbyinput");
const isSearch = (url: string) => url.includes("/samplingcollection/searchbycityname");

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchCollectesByCity", () => {
  it("renvoie 'empty' sans appel réseau pour une requête trop courte", async () => {
    const fetchMock = mockFetch(() => ({ ok: true, body: [] }));
    expect(await fetchCollectesByCity(" a ")).toEqual({
      status: "empty",
      query: "a",
      collectes: [],
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renvoie 'not-found' quand le géocodage ne retourne aucune ville", async () => {
    mockFetch((url) => (isGeocode(url) ? { ok: true, body: [] } : { ok: true, body: {} }));
    expect(await fetchCollectesByCity("Trifouillis")).toMatchObject({ status: "not-found" });
  });

  it("renvoie 'not-found' quand la ville n'a pas de coordonnées", async () => {
    mockFetch((url) =>
      isGeocode(url) ? { ok: true, body: [{ nom: "Sans GPS" }] } : { ok: true, body: {} },
    );
    expect(await fetchCollectesByCity("Sans GPS")).toMatchObject({ status: "not-found" });
  });

  it("ignore les entrées sans coordonnées et retient la première ville géocodée", async () => {
    const fetchMock = mockFetch((url) => {
      if (isGeocode(url)) return { ok: true, body: [{ nom: "Fantôme" }, CITY] };
      return { ok: true, body: FIXED_SITE };
    });
    const result = await fetchCollectesByCity("Toulouse");
    expect(result.status).toBe("ok");
    expect(result.query).toBe("Toulouse");
    expect(result.collectes.length).toBeGreaterThan(0);
    const searchUrl = fetchMock.mock.calls.map(([u]) => String(u)).find(isSearch)!;
    expect(searchUrl).toContain("UserLatitude=43.6");
    expect(searchUrl).toContain("UserLongitude=1.44");
  });

  it("renvoie 'error' quand la recherche de collectes répond en erreur HTTP", async () => {
    mockFetch((url) => (isGeocode(url) ? { ok: true, body: [CITY] } : { ok: false, body: null }));
    expect(await fetchCollectesByCity("Toulouse")).toMatchObject({ status: "error" });
  });

  it("renvoie 'error' quand la réponse de recherche n'est pas du JSON", async () => {
    mockFetch((url) => (isGeocode(url) ? { ok: true, body: [CITY] } : "bad-json"));
    expect(await fetchCollectesByCity("Toulouse")).toMatchObject({ status: "error" });
  });

  it("renvoie 'not-found' quand le géocodage jette (réseau indisponible)", async () => {
    mockFetch((url) => (isGeocode(url) ? "throw" : { ok: true, body: {} }));
    expect(await fetchCollectesByCity("Toulouse")).toMatchObject({ status: "not-found" });
  });

  it("met le géocodage en cache bien plus longtemps que la recherche de collectes", async () => {
    const fetchMock = mockFetch((url) =>
      isGeocode(url) ? { ok: true, body: [CITY] } : { ok: true, body: FIXED_SITE },
    );
    await fetchCollectesByCity("Toulouse");

    const revalidateFor = (matches: (url: string) => boolean) =>
      fetchMock.mock.calls.find(([u]) => matches(String(u)))?.[1]?.next?.revalidate;

    const geocodeRevalidate = revalidateFor(isGeocode);
    const searchRevalidate = revalidateFor(isSearch);
    expect(geocodeRevalidate).toBeGreaterThan(searchRevalidate as number);
    expect(geocodeRevalidate).toBe(60 * 60 * 24 * 7);
  });

  it("renvoie 'not-found' quand aucune collecte n'est encore à venir", async () => {
    mockFetch((url) => {
      if (isGeocode(url)) return { ok: true, body: [CITY] };
      return {
        ok: true,
        body: {
          samplingLocationCollections: [
            {
              name: "Salle passée",
              city: "Toulouse",
              postCode: "31000",
              giveBlood: 1,
              collections: [{ id: 1, date: "2020-01-01T00:00:00", isPublishable: true }],
            },
          ],
        },
      };
    });
    expect(await fetchCollectesByCity("Toulouse")).toMatchObject({ status: "not-found" });
  });
});

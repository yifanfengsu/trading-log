"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Shared skeleton for the six "collection" stores (trades, reviews, reports,
// playbooks, notes, goals). Each one previously re-declared the same machinery:
// state + ref, a sort-applying `apply`, an optimistic `persist` with rollback,
// a mount-time load with a one-time localStorage→SQLite migration, and the
// replace / clear / reset bulk operations. This hook owns all of that so the
// domain providers only declare their type-specific methods.
//
// IMPORTANT: `config` must be a module-level constant (stable identity) so the
// callbacks below stay referentially stable and the mount effect runs once.

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export interface CollectionLegacyConfig<T> {
  /** Legacy localStorage key read once during migration. */
  storageKey: string;
  /** Marker written after migration so it never runs twice. */
  migrationFlagKey: string;
  /** Parse + validate a legacy localStorage value into an item list. */
  parse: (raw: string | null) => T[] | null;
}

export interface CollectionStoreConfig<T> {
  /** Short name used for log labels (e.g. "trades"). */
  name: string;
  /** Collection API base path (e.g. "/api/trades"). */
  basePath: string;
  /** Optional stable sort applied to every in-memory update. */
  sort?: (items: T[]) => T[];
  /** Optional factory for the "reset to seed" bulk operation. */
  seed?: () => T[];
  /** Optional legacy localStorage migration settings. */
  legacy?: CollectionLegacyConfig<T>;
}

async function fetchCollection<T>(basePath: string): Promise<T[]> {
  const response = await fetch(basePath);

  if (!response.ok) {
    throw new Error(`GET ${basePath} failed with status ${response.status}`);
  }

  const data: unknown = await response.json();
  return Array.isArray(data) ? (data as T[]) : [];
}

export function useCollectionStore<T>(config: CollectionStoreConfig<T>) {
  const { name, basePath, sort, seed, legacy } = config;

  const [items, setItems] = useState<T[]>([]);
  const itemsRef = useRef<T[]>([]);

  const apply = useCallback(
    (nextItems: T[]) => {
      const sortedItems = sort ? sort(nextItems) : nextItems;
      itemsRef.current = sortedItems;
      setItems(sortedItems);
    },
    [sort],
  );

  const persist = useCallback(
    async (
      request: () => Promise<Response>,
      previousItems: T[],
      label: string,
    ) => {
      try {
        const response = await request();

        if (!response.ok) {
          throw new Error(`${label} failed with status ${response.status}`);
        }
      } catch (error) {
        console.error(`[${name}] ${label} failed — rolling back`, error);
        apply(previousItems);
      }
    },
    [apply, name],
  );

  // One-time import of legacy localStorage data into SQLite. Runs only when the
  // migration flag is unset (checked here) and the database is empty (checked by
  // the caller). The flag is recorded even when there is no legacy data so the
  // check never runs again — the marker, not "database empty", is the real gate.
  const migrateLegacy = useCallback(async (): Promise<boolean> => {
    if (!legacy || typeof window === "undefined") {
      return false;
    }

    if (window.localStorage.getItem(legacy.migrationFlagKey)) {
      return false;
    }

    const legacyItems = legacy.parse(
      window.localStorage.getItem(legacy.storageKey),
    );

    if (!legacyItems || legacyItems.length === 0) {
      window.localStorage.setItem(
        legacy.migrationFlagKey,
        new Date().toISOString(),
      );
      return false;
    }

    try {
      const response = await fetch(`${basePath}/import`, {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify(legacyItems),
      });

      if (!response.ok) {
        throw new Error(`import failed with status ${response.status}`);
      }

      window.localStorage.setItem(
        legacy.migrationFlagKey,
        new Date().toISOString(),
      );

      return true;
    } catch (error) {
      console.error(`[${name}] migration from localStorage failed`, error);
      return false;
    }
  }, [basePath, legacy, name]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        let serverItems = await fetchCollection<T>(basePath);

        if (serverItems.length === 0) {
          const migrated = await migrateLegacy();

          if (migrated) {
            serverItems = await fetchCollection<T>(basePath);
          }
        }

        if (!cancelled) {
          apply(serverItems);
        }
      } catch (error) {
        console.error(`[${name}] failed to load from API`, error);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [apply, basePath, migrateLegacy, name]);

  const replace = useCallback(
    (nextItems: T[]) => {
      const previousItems = itemsRef.current;
      const snapshot = [...nextItems];

      apply(snapshot);

      void persist(
        () =>
          fetch(`${basePath}/import`, {
            method: "POST",
            headers: JSON_HEADERS,
            body: JSON.stringify(snapshot),
          }),
        previousItems,
        `POST ${basePath}/import (replace)`,
      );
    },
    [apply, basePath, persist],
  );

  const clear = useCallback(() => {
    const previousItems = itemsRef.current;

    apply([]);

    void persist(
      () =>
        fetch(`${basePath}/import`, {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify([]),
        }),
      previousItems,
      `POST ${basePath}/import (clear)`,
    );
  }, [apply, basePath, persist]);

  const reset = useCallback(() => {
    if (!seed) {
      return;
    }

    const seedItems = seed();
    const previousItems = itemsRef.current;

    apply(seedItems);

    void persist(
      () =>
        fetch(`${basePath}/import`, {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify(seedItems),
        }),
      previousItems,
      `POST ${basePath}/import (reset)`,
    );
  }, [apply, basePath, persist, seed]);

  return { items, itemsRef, apply, persist, replace, clear, reset };
}

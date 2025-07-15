/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as scrapeReddit from "../scrapeReddit.js";
import type * as scrapeTwitter from "../scrapeTwitter.js";
import type * as seedTrends from "../seedTrends.js";
import type * as trendScraper from "../trendScraper.js";
import type * as trends from "../trends.js";
import type * as users from "../users.js";
import type * as videos from "../videos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  scrapeReddit: typeof scrapeReddit;
  scrapeTwitter: typeof scrapeTwitter;
  seedTrends: typeof seedTrends;
  trendScraper: typeof trendScraper;
  trends: typeof trends;
  users: typeof users;
  videos: typeof videos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

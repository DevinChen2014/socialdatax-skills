import assert from "node:assert/strict";
import test from "node:test";
import {
  EXTENDED_COMMANDS, TOOL_CONTRACTS, buildExtendedCall, extendedCommandOptions,
  findExtendedCommand, parameterOption, extendedHelp,
} from "../lib/commands/extended.mjs";

function call(platform, action, options) {
  const definition = findExtendedCommand(platform, action, options);
  assert.ok(definition, `${platform} ${action}`);
  return buildExtendedCall(definition, options);
}

test("new search routes preserve the exact keyword and continuation token", () => {
  const keyword = "露营 + 摄影";
  const pageToken = "opaque+%2F==中文";
  for (const platform of ["xhs", "douyin", "tiktok", "weibo", "zhihu", "instagram", "x", "bilibili", "toutiao"]) {
    assert.deepEqual(call(platform, "user-search", { keyword, pageToken }), {
      tool: `${platform}_search_users`, toolArguments: { keyword, page_token: pageToken },
    });
  }
  for (const platform of ["xhs", "douyin", "tiktok", "weibo", "zhihu", "x", "bilibili", "kuaishou", "youtube", "toutiao"]) {
    assert.deepEqual(call(platform, "search-suggestions", { keyword }), {
      tool: `${platform}_search_suggestions`, toolArguments: { keyword },
    });
  }
  assert.equal(call("youtube", "channel-search", { keyword }).tool, "youtube_search_channels");
  assert.equal(call("instagram", "tag-search", { keyword }).tool, "instagram_search_tags");
  assert.equal(call("wechat", "user-search", { keyword }).tool, "wechat_search_finder_user");
});

test("product filters become typed public arguments without filling defaults", () => {
  assert.match(extendedHelp("douyin", "product-search"), /CNY yuan \(元\)/);
  assert.deepEqual(call("douyin", "product-search", {
    keyword: "鞋", minPrice: "1200", maxPrice: "null", onlyLive: true,
    shippingInsurance: "false", dispatchWithin24h: "true", officialStore: "false",
    sevenDayReturn: "true", sellingPoint: "high_rating", sortType: "sales_descending",
  }).toolArguments, {
    keyword: "鞋", min_price: 1200, max_price: null, only_live: true,
    dispatch_within_24h: true, shipping_insurance: false, seven_day_return: true,
    selling_point: "high_rating", official_store: false, sort_type: "sales_descending",
  });
  assert.deepEqual(call("douyin", "product-search", { keyword: "鞋" }).toolArguments, { keyword: "鞋" });
  for (const minPrice of ["0", "-1", "1.5", true, "9007199254740992"]) {
    assert.throws(() => call("douyin", "product-search", { keyword: "鞋", minPrice }), /--min-price/);
  }
  assert.throws(() => call("douyin", "product-search", { keyword: "鞋", onlyLive: "yes" }), /true or false/);
  assert.deepEqual(call("xhs", "product-reviews", { skuId: "sku", hasImage: "false", sortType: "time_descending" }).toolArguments,
    { sku_id: "sku", has_image: false, sort_type: "time_descending" });
  assert.deepEqual(call("xhs", "product-review-reply-replies", { reviewId: "review" }).toolArguments, { review_id: "review" });
});

test("URL and ID alternatives require exactly one input", () => {
  for (const [platform, idOption, idArgument, idSuffix] of [
    ["xhs", "skuId", "sku_id", "sku_id"], ["douyin", "productId", "product_id", "product_id"],
  ]) {
    assert.deepEqual(call(platform, "product-detail", { [idOption]: "id" }), {
      tool: `${platform}_get_product_detail_by_${idSuffix}`, toolArguments: { [idArgument]: "id" },
    });
    assert.deepEqual(call(platform, "product-detail", { url: "https://example.com/商品?a=1&b=2" }).toolArguments,
      { url: "https://example.com/商品?a=1&b=2" });
    assert.throws(() => call(platform, "product-detail", { [idOption]: "id", url: "url" }), /exactly one/);
    assert.throws(() => call(platform, "product-detail", {}), /exactly one/);
  }
  assert.deepEqual(call("xhs", "topic-notes", { url: "https://example.com/topic", sortType: "hot" }).toolArguments,
    { topic_url: "https://example.com/topic", sort_type: "hot" });
  assert.equal(call("xhs", "topic-notes", { pageId: "page" }).tool, "xhs_get_topic_notes_by_page_id");
});

test("PGY creator commands enforce the existing user ID and note-scope contracts", () => {
  const userId = "1234567890abcdef12345678";
  assert.deepEqual(call("xhs", "pgy-creator-notes-performance", { userId, noteScope: "cooperation" }), {
    tool: "xhs_pgy_get_creator_notes_performance", toolArguments: { user_id: userId, note_scope: "cooperation" },
  });
  assert.throws(() => call("xhs", "pgy-creator-profile", { userId: "short-id" }), /required format/);
  assert.throws(() => call("xhs", "pgy-creator-notes-performance", { userId, noteScope: "all" }), /daily, cooperation/);
  assert.match(extendedHelp("xhs", "pgy-creator-profile"), /20 积分/);
});

test("Tieba distinguishes forum, thread, and user inputs and only exposes supported pagination", () => {
  assert.deepEqual(call("tieba", "forum-posts", { forumName: "摄影", featuredOnly: "false", sortType: "latest_reply" }).toolArguments,
    { forum_name: "摄影", sort_type: "latest_reply", featured_only: false });
  assert.deepEqual(call("tieba", "comments", { threadId: "123", pageToken: "opaque", sortType: "oldest" }).toolArguments,
    { thread_id: "123", page_token: "opaque", sort_type: "oldest" });
  assert.equal(call("tieba", "user-forums", { profileUrl: "https://tieba.baidu.com/home/main?id=abc" }).tool,
    "baidu_tieba_get_user_followed_forums_by_profile_url");
  const options = extendedCommandOptions(findExtendedCommand("tieba", "user-search"));
  assert.ok(!options.includes("pageToken"));
  assert.ok(!options.includes("pages"));
  assert.ok(extendedCommandOptions(findExtendedCommand("tieba", "forum-search")).includes("pages"));
  assert.throws(() => call("tieba", "replies", { threadId: "0", commentId: "1" }), /required format/);
});

test("Official Account replies keep optional comment IDs optional", () => {
  const url = "https://mp.weixin.qq.com/s/example";
  assert.deepEqual(call("wechat", "article-replies", { url }), {
    tool: "wechat_get_mp_article_comment_replies_by_url", toolArguments: { url },
  });
  assert.deepEqual(call("wechat", "article-replies", { url, commentId: "123", pageToken: "opaque" }).toolArguments,
    { url, comment_id: "123", page_token: "opaque" });
  assert.deepEqual(call("wechat", "share-link", { objectId: "9007199254740993" }).toolArguments,
    { object_id: "9007199254740993" });
});

test("six transcript command families use their exact URL and ID parameter names", () => {
  for (const [platform, urlSuffix, urlArgument, idOption, idArgument] of [
    ["bilibili", "video_url", "video_url", "bvid", "bvid"],
    ["zhihu", "video_url", "video_url", "zvideoId", "zvideo_id"],
    ["instagram", "post_url", "post_url", "postId", "post_id"],
    ["x", "post_url", "post_url", "postId", "post_id"],
    ["tiktok", "url", "video_url", "awemeId", "aweme_id"],
    ["youtube", "url", "video_url", "videoId", "video_id"],
  ]) {
    const byUrl = call(platform, "transcript", { url: "https://example.com/video?p=2" });
    assert.equal(byUrl.tool, `${platform}_submit_video_speech_text_by_${urlSuffix}`);
    assert.deepEqual(byUrl.toolArguments, { [urlArgument]: "https://example.com/video?p=2" });
    const byId = call(platform, "transcript", { [idOption]: "example" });
    assert.equal(byId.tool, `${platform}_submit_video_speech_text_by_${idArgument}`);
    assert.deepEqual(byId.toolArguments, { [idArgument]: "example" });
    assert.equal(byId.transcriptJobTool, `${platform}_get_video_speech_text_job`);
    assert.equal(call(platform, "transcript", { jobId: "existing" }).transcriptIsJobLookup, true);
    assert.throws(() => call(platform, "transcript", { jobId: "existing", [idOption]: "example" }), /exactly one/);
  }
});

test("docs numeric bounds and required values are validated before connecting", () => {
  assert.deepEqual(call("docs", "search", { query: "搜索", platformId: "baidu-tieba", limit: "50", offset: "0" }).toolArguments,
    { query: "搜索", platform_id: "baidu-tieba", limit: 50, offset: 0 });
  for (const options of [{ limit: "51" }, { offset: "-1" }]) assert.throws(() => call("docs", "search", options), /allowed range/);
  assert.throws(() => call("docs", "operation", { operationId: true }), /non-empty value/);
  assert.throws(() => call("xhs", "user-search", { keyword: " " }), /non-empty value/);
});

test("every packaged extended tool has a reachable command and every option is documented", () => {
  assert.deepEqual(new Set(EXTENDED_COMMANDS.flatMap((command) => command.tools)), new Set(Object.keys(TOOL_CONTRACTS)));
  for (const definition of EXTENDED_COMMANDS) {
    const help = extendedHelp(definition.platform, definition.action);
    for (const name of definition.tools) {
      assert.ok(help.includes(name));
      for (const parameter of Object.keys(TOOL_CONTRACTS[name].parameters)) {
        assert.ok(extendedCommandOptions(definition).includes(parameterOption(definition, parameter)));
      }
    }
  }
});

import assert from "node:assert/strict";
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  generateSkills,
  loadSkillSource,
} from "../../../scripts/generate_socialdatax_skills.mjs";

const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const projectRoot = resolve(packageDir, "..", "..");

function readGeneratedSkill(tempRoot, host, slug, hosts) {
  return readFileSync(
    join(tempRoot, hosts[host].outputDir, slug, "SKILL.md"),
    "utf8"
  );
}

function readRepoSkill(projectRoot, host, slug, hosts) {
  return readFileSync(
    join(projectRoot, hosts[host].outputDir, slug, "SKILL.md"),
    "utf8"
  );
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractFrontmatter(skill) {
  const match = skill.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, "skill should start with frontmatter");
  return match[1];
}

function frontmatterScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${escapeRegExp(key)}: (.+)$`, "m"));
  assert.ok(match, `frontmatter should include ${key}`);
  const raw = match[1].trim();
  return raw.startsWith('"') ? JSON.parse(raw) : raw;
}

function assertJsonQuotedFrontmatterScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${escapeRegExp(key)}: (.+)$`, "m"));
  assert.ok(match, `frontmatter should include ${key}`);
  assert.match(match[1], /^"/, `${key} should be safely quoted`);
  assert.equal(typeof JSON.parse(match[1]), "string");
}

function commandRefsForListing(catalog, listing) {
  const capabilityIds = listing.capabilities ?? (listing.capability ? [listing.capability] : []);
  const defaultCommands = capabilityIds.flatMap(
    (capabilityId) => catalog.capabilities[capabilityId]?.commands ?? []
  );
  const commands = Object.hasOwn(listing, "commands")
    ? listing.commands
    : defaultCommands;
  const extraCommands = Object.hasOwn(listing, "extraCommands")
    ? listing.extraCommands
    : [];
  return [...new Set([...commands, ...extraCommands])];
}

function resolveCommandInfo(catalog, commandRef) {
  const [platformName, commandName] = commandRef.split(".");
  const platform = catalog.platforms[platformName];
  assert.ok(platform, `unknown platform ${platformName} in ${commandRef}`);
  assert.ok(
    platform.commands[commandName],
    `missing CLI command for ${commandRef}`
  );
  assert.ok(platform.tools[commandName], `missing MCP tool for ${commandRef}`);
  return {
    command: platform.commands[commandName],
    tool: platform.tools[commandName],
  };
}

function parseCliAvailableSkillNames(cliSource) {
  const block = cliSource.match(/const AVAILABLE_SKILLS = \[([\s\S]*?)\];/);
  assert.ok(block, "cli.mjs should define AVAILABLE_SKILLS");
  return [...block[1].matchAll(/name: "([^"]+)"/g)]
    .map((match) => match[1])
    .sort();
}

function parseSimpleYamlScalar(source, key) {
  const match = source.match(new RegExp(`^\\s{2}${escapeRegExp(key)}: (.+)$`, "m"));
  assert.ok(match, `openai.yaml should define interface.${key}`);
  const raw = match[1].trim();
  return raw.startsWith('"') ? JSON.parse(raw) : raw;
}

function copySkillSourceTo(root) {
  const sourceDir = join(root, "public-listings", "socialdatax-skill-source");
  mkdirSync(sourceDir, { recursive: true });
  for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
    copyFileSync(
      join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
      join(sourceDir, fileName)
    );
  }
  return sourceDir;
}

test("skill generator emits valid host-specific skill files", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    const result = await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    assert.equal(result.generated.length, source.listings.listings.length);
    assert.equal(result.warnings.length, 0);

    for (const listing of source.listings.listings) {
      const skill = readGeneratedSkill(
        tempRoot,
        listing.host,
        listing.slug,
        source.hosts.hosts
      );
      const host = source.hosts.hosts[listing.host];
      const frontmatter = extractFrontmatter(skill);

      assert.equal(frontmatterScalar(frontmatter, "name"), listing.slug);
      assert.equal(frontmatterScalar(frontmatter, "description"), listing.description);
      assertJsonQuotedFrontmatterScalar(frontmatter, "description");
      assert.match(skill, /<!-- AUTO-GENERATED from socialdatax-skill-source/);
      assert.match(skill, /SOCIALDATAX_API_KEY/);
      assert.match(skill, new RegExp(escapeRegExp(host.homepage)));
      assert.match(skill, new RegExp(`\\?from=${escapeRegExp(listing.host)}`));
      assert.match(skill, /read-only/i);
      assert.match(skill, /npx -y socialdatax-skills@latest/);

      assert.doesNotMatch(skill, /SOCIAL_MEDIA_MCP_API_KEY/);
      assert.doesNotMatch(skill, /XHS_MCP_API_KEY/);
      assert.doesNotMatch(skill, /DOUYIN_MCP_API_KEY/);
      assert.doesNotMatch(skill, /KUAISHOU_MCP_API_KEY/);
      assert.doesNotMatch(skill, /Social Media Data Assistant/);
      assert.doesNotMatch(skill, /Social Media Insights/);
      assert.doesNotMatch(skill, /Social Insights Assistant/);
    }

    const xhsComments = readGeneratedSkill(
      tempRoot,
      "clawhub",
      "socialdatax-xhs-comments",
      source.hosts.hosts
    );
    const douyinComments = readGeneratedSkill(
      tempRoot,
      "clawhub",
      "socialdatax-douyin-comments",
      source.hosts.hosts
    );

    assert.doesNotMatch(xhsComments, /Douyin|抖音|video\.play_url|aweme-id/);
    assert.doesNotMatch(douyinComments, /XHS|Xiaohongshu|小红书|note-id/);

    const xhsDetail = readGeneratedSkill(
      tempRoot,
      "clawhub",
      "socialdatax-xhs-detail",
      source.hosts.hosts
    );
    const xhsCreatorNotes = readGeneratedSkill(
      tempRoot,
      "clawhub",
      "socialdatax-xhs-creator-notes",
      source.hosts.hosts
    );
    const douyinSearch = readGeneratedSkill(
      tempRoot,
      "clawhub",
      "socialdatax-douyin-search",
      source.hosts.hosts
    );
    const kuaishouSearch = readGeneratedSkill(
      tempRoot,
      "clawhub",
      "socialdatax-kuaishou-search",
      source.hosts.hosts
    );
    const kuaishouComments = readGeneratedSkill(
      tempRoot,
      "clawhub",
      "socialdatax-kuaishou-comments",
      source.hosts.hosts
    );

    assert.doesNotMatch(xhsDetail, /Douyin|抖音|video\.play_url|aweme-id/);
    assert.doesNotMatch(xhsCreatorNotes, /Douyin|抖音|short-drama|video playback URL|sec-user-id/);
    assert.doesNotMatch(douyinSearch, /XHS|Xiaohongshu|小红书|RedNote|note type|Kuaishou|快手|photo-id|\bnext_page\b/);
    assert.doesNotMatch(kuaishouSearch, /XHS|Xiaohongshu|小红书|RedNote|Douyin|抖音|note type|aweme-id|sec-user-id|short-drama/);
    assert.doesNotMatch(kuaishouComments, /XHS|Xiaohongshu|小红书|RedNote|Douyin|抖音|note-id|aweme-id|video\.play_url/);
    assert.match(
      douyinSearch,
      /Douyin `--pages <n>`: fetch and merge N search pages from the current starting point; continue with returned `next_page_token`\./
    );
    assert.match(
      douyinSearch,
      /Do not pass `page` to `douyin_search_videos`; omit `page_token` on the first request\./
    );
    assert.match(
      kuaishouSearch,
      /Kuaishou `--pages <n>`: fetch and merge N search pages from the current starting point; continue with returned `next_page_token`\./
    );
    assert.match(
      kuaishouSearch,
      /Do not pass `page` to `kuaishou_search_videos`; omit `page_token` on the first request\./
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("each declared command reference renders matching CLI and MCP tool guidance", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const listing of source.listings.listings) {
      const skill = readGeneratedSkill(
        tempRoot,
        listing.host,
        listing.slug,
        source.hosts.hosts
      );

      for (const commandRef of commandRefsForListing(source.catalog, listing)) {
        const { command, tool } = resolveCommandInfo(source.catalog, commandRef);

        assert.match(
          skill,
          new RegExp(`npx -y socialdatax-skills@latest ${escapeRegExp(command)}`),
          `${listing.host}/${listing.slug} should include CLI for ${commandRef}`
        );
        assert.match(
          skill,
          new RegExp(`\\\`${escapeRegExp(tool)}\\\``),
          `${listing.host}/${listing.slug} should include MCP tool ${tool}`
        );
      }
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("douyin creator skills keep sec-user-id argument guidance", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const creatorProfile = readGeneratedSkill(
      tempRoot,
      "clawhub",
      "socialdatax-douyin-creator-profile",
      source.hosts.hosts
    );
    const creatorVideos = readGeneratedSkill(
      tempRoot,
      "clawhub",
      "socialdatax-douyin-creator-videos",
      source.hosts.hosts
    );

    assert.match(creatorProfile, /Douyin `--sec-user-id <sec_user_id>`/);
    assert.match(creatorVideos, /Douyin `--sec-user-id <sec_user_id>`/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("hot-search listings document no keyword requirement and include the hot-search MCP tool", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const [host, slug] of [
      ["clawhub", "socialdatax-xhs"],
      ["skillhub", "xhs-trend-insights"],
      ["skillhub", "socialdatax-xhs-trend-insights"],
      ["clawhub", "socialdatax-douyin-search"],
      ["skillhub", "douyin-trend-insights"],
      ["skillhub", "douyin-content-research"],
      ["clawhub", "socialdatax-kuaishou-search"],
      ["skillhub", "kuaishou-trend-insights"],
      ["skillhub", "kuaishou-content-research"],
    ]) {
      const skill = readGeneratedSkill(tempRoot, host, slug, source.hosts.hosts);

      assert.match(skill, /hot-search --pretty/);
      if (slug.includes("xhs")) {
        assert.match(skill, /xhs hot-search --pretty/);
        assert.match(skill, /`xhs_get_search_hot_list`/);
        assert.match(skill, /XHS `hot-search`: no required arguments\./);
      }
      if (slug.includes("douyin")) {
        assert.match(skill, /douyin hot-search --pretty/);
        assert.match(skill, /`douyin_get_hot_search_list`/);
        assert.match(skill, /Douyin `hot-search`: no required arguments\./);
        assert.match(
          skill,
          /Douyin `search --keyword <text>`: required only when using `douyin search`/
        );
      }
      if (slug.includes("kuaishou")) {
        assert.match(skill, /kuaishou hot-search --pretty/);
        assert.match(skill, /`kuaishou_get_hot_search_list`/);
        assert.match(skill, /Kuaishou `hot-search`: no required arguments\./);
        assert.match(
          skill,
          /Kuaishou `search --keyword <text>`: required only when using `kuaishou search`/
        );
      }
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("creator research combines profile, posts, series commands and output guidance", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const skill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "socialdatax-creator-research",
      source.hosts.hosts
    );

    for (const pattern of [
      /xhs user-info --profile-url/,
      /xhs user-posts --profile-url/,
      /douyin user-info --profile-url/,
      /douyin user-posts --profile-url/,
      /douyin user-series --profile-url/,
      /kuaishou user-info --profile-url/,
      /kuaishou user-posts --profile-url/,
      /`xhs_get_user_info_by_profile_url`/,
      /`xhs_get_user_posted_notes_by_profile_url`/,
      /`douyin_get_user_info_by_profile_url`/,
      /`douyin_get_user_posted_videos_by_profile_url`/,
      /`douyin_get_user_series_by_profile_url`/,
      /`kuaishou_get_user_info_by_profile_url`/,
      /`kuaishou_get_user_posted_videos_by_profile_url`/,
      /Report profile fields such as name/,
      /Summarize content-list evidence/,
      /For Douyin short-drama series/,
    ]) {
      assert.match(skill, pattern);
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated aggregate scenario skills keep guidance concise", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const noisyPhrases = [
    "The command prints JSON with `platform`, `tool`, `arguments`, and `data`.",
    "If MCP tools are already available in the current agent, use one of these tools:",
    "- `--pretty`: output formatting only.",
    "Use either the ID option or the profile URL option for a single command, not both.",
  ];
  const lineLimits = new Map([
    ["skillhub/socialdatax-content-research-assistant", 190],
    ["skillhub/short-video-topic-research", 220],
    ["skillhub/xhs-content-research-assistant", 150],
    ["skillhub/socialdatax-creator-research", 130],
    ["npm/socialdatax-content-research-assistant", 230],
  ]);

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const [key, maxLines] of lineLimits.entries()) {
      const [host, slug] = key.split("/");
      const skill = readGeneratedSkill(tempRoot, host, slug, source.hosts.hosts);

      assert.ok(
        skill.split("\n").length <= maxLines,
        `${key} should stay concise enough for marketplace review`
      );
      for (const phrase of noisyPhrases) {
        const count = skill.split(phrase).length - 1;
        assert.ok(count <= 1, `${key} should not repeat ${phrase}`);
      }
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated guidance lines are de-duplicated after capability merging", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const [host, slug] of [
      ["clawhub", "socialdatax-douyin-search"],
      ["skillhub", "douyin-trend-insights"],
      ["skillhub", "douyin-content-research"],
      ["clawhub", "socialdatax-kuaishou-search"],
      ["skillhub", "kuaishou-trend-insights"],
      ["skillhub", "kuaishou-content-research"],
    ]) {
      const skill = readGeneratedSkill(tempRoot, host, slug, source.hosts.hosts);
      const prettyLines = skill
        .split("\n")
        .filter((line) => line.includes("`--pretty`: output formatting only"));

      assert.equal(
        prettyLines.length,
        1,
        `${host}/${slug} should not repeat --pretty guidance after merging hot-search and search`
      );
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("structured body guidance preserves repeated bullets in separate sections", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const skill = readGeneratedSkill(
      tempRoot,
      "npm",
      "media-search",
      source.hosts.hosts
    );

    assert.match(
      skill,
      /Douyin sort values:\n- `general`: default sorting\.\n- `time_descending`: newest first\.\n- `like_count_descending`: most liked first\./
    );
    assert.match(
      skill,
      /Douyin publish-time filter values:\n- `all`: no publish-time filter\.\n- `day`: published within one day\.\n- `week`: published within one week\.\n- `half_year`: published within half a year\./
    );
    assert.match(
      skill,
      /Kuaishou search pagination:\n- Continue only when `next_page_token` is not empty\./
    );
    assert.match(
      skill,
      /For Kuaishou, call `kuaishou_search_videos` with:\n- `keyword`: required search phrase or topic\.\n- `page_token`: optional opaque pagination token\. Continue only with the complete returned `next_page_token` from the same search pagination chain\./
    );
    assert.doesNotMatch(
      skill,
      /For Kuaishou, call `kuaishou_search_videos` with:\nContinue Kuaishou pagination/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated skills separate numeric page from token pagination by platform", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const mediaSearch = readGeneratedSkill(
      tempRoot,
      "npm",
      "media-search",
      source.hosts.hosts
    );
    const aggregateResearch = readGeneratedSkill(
      tempRoot,
      "npm",
      "socialdatax-content-research-assistant",
      source.hosts.hosts
    );

    assert.match(
      mediaSearch,
      /Do not pass `page` to `douyin_search_videos`; omit `page_token` on the first request\./
    );
    assert.match(
      mediaSearch,
      /Do not pass `page` to `kuaishou_search_videos`; omit `page_token` on the first request\./
    );
    assert.match(
      aggregateResearch,
      /XHS numeric `page` is only for XHS search; Douyin, Kuaishou, Weibo, and WeChat Channels search use `page_token` only/
    );
    assert.doesNotMatch(aggregateResearch, /`--page` and `--page-token`/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("kuaishou platform is present in source and generated public skills", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    assert.ok(source.catalog.platforms.kuaishou, "catalog should include kuaishou");
    for (const commandRef of [
      "kuaishou.hotSearch",
      "kuaishou.search",
      "kuaishou.detailId",
      "kuaishou.detailUrl",
      "kuaishou.commentsId",
      "kuaishou.commentsUrl",
      "kuaishou.replies",
      "kuaishou.userInfoId",
      "kuaishou.userInfoUrl",
      "kuaishou.userPostsId",
      "kuaishou.userPostsUrl",
    ]) {
      resolveCommandInfo(source.catalog, commandRef);
    }

    const aggregate = readGeneratedSkill(
      tempRoot,
      "npm",
      "socialdatax-content-research-assistant",
      source.hosts.hosts
    );
    const mediaSearch = readGeneratedSkill(
      tempRoot,
      "npm",
      "media-search",
      source.hosts.hosts
    );
    const kuaishouHub = readGeneratedSkill(
      tempRoot,
      "clawhub",
      "socialdatax-kuaishou",
      source.hosts.hosts
    );

    for (const skill of [aggregate, mediaSearch, kuaishouHub]) {
      assert.match(skill, /Kuaishou|快手/);
      assert.match(skill, /npx -y socialdatax-skills@latest kuaishou/);
      assert.match(skill, /`kuaishou_/);
    }
    assert.match(kuaishouHub, /kuaishou replies --photo-id/);
    assert.match(kuaishouHub, /kuaishou_get_video_comment_replies_by_comment_id/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("active SkillHub public title description and useWhen avoid restricted terms", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const restrictedTerms =
    /搜索|检索|数据获取|API 数据|只读数据能力|crawler|spider|scrape|爬虫|抓取/i;

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const listing of source.listings.listings) {
      if (listing.host !== "skillhub" || listing.publishStatus === "retained") {
        continue;
      }
      const skill = readGeneratedSkill(
        tempRoot,
        listing.host,
        listing.slug,
        source.hosts.hosts
      );
      const frontmatter = extractFrontmatter(skill);
      const title = skill.match(/^# (.+)$/m)?.[1] ?? "";
      const description = frontmatterScalar(frontmatter, "description");
      const useWhen = skill.split(`\n# ${title}\n\n`)[1]?.split("\n\n")[0] ?? "";

      assert.doesNotMatch(
        `${title}\n${description}\n${useWhen}`,
        restrictedTerms,
        `${listing.slug} should avoid SkillHub restricted terms`
      );
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("SkillHub listings do not advertise workflow families absent from command refs", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const listing of source.listings.listings) {
      if (listing.host !== "skillhub" || listing.publishStatus === "retained") {
        continue;
      }
      const commandRefs = commandRefsForListing(source.catalog, listing);
      const skill = readGeneratedSkill(
        tempRoot,
        listing.host,
        listing.slug,
        source.hosts.hosts
      );
      const hasDetail = commandRefs.some((commandRef) =>
        /\.detail/.test(commandRef)
      );
      const hasComments = commandRefs.some((commandRef) =>
        /\.(comments|replies)/.test(commandRef)
      );
      const hasCreator = commandRefs.some((commandRef) =>
        /\.(userInfo|userPosts|userSeries)/.test(commandRef)
      );

      if (!hasDetail) {
        assert.doesNotMatch(
          skill,
          /Detail review for a note|detail command|作品复盘|爆款复盘|viral review|work review/i,
          `${listing.slug} should not promise detail workflows without detail commands`
        );
      }
      if (!hasComments) {
        assert.doesNotMatch(
          skill,
          /comment review|Comment insight or discussion summary|comments command|评论反馈|评论洞察|comment feedback|comment insight/i,
          `${listing.slug} should not promise comment workflows without comment commands`
        );
      }
      if (!hasCreator) {
        assert.doesNotMatch(
          skill,
          /creator facts|Creator profile review|Creator content list review|creator posts or works command|账号研究|account research/i,
          `${listing.slug} should not promise creator workflows without creator commands`
        );
      }
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated skills preserve XHS note URLs and complete note IDs", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const generatedSkills = source.listings.listings.map((listing) => [
      `${listing.host}/${listing.slug}`,
      readGeneratedSkill(tempRoot, listing.host, listing.slug, source.hosts.hosts),
    ]);

    const searchOrDetailSkills = generatedSkills.filter(([, skill]) =>
      /`xhs_search_notes`|`xhs_get_note_detail_by_note_(?:id|url)`/.test(skill)
    );
    assert.ok(
      searchOrDetailSkills.length > 0,
      "test should find generated skills that expose XHS search or detail tools"
    );
    for (const [label, skill] of searchOrDetailSkills) {
      assert.match(
        skill,
        /in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding/,
        `${label} should require exact note_url preservation`
      );
      assert.match(
        skill,
        /preserve it exactly as the full URL, including `xsec_token` query parameters/,
        `${label} should require preserving the full note_url`
      );
      assert.match(
        skill,
        /Do not modify, truncate, redact, mask, normalize, rebuild, or synthesize the URL from `note_id`/,
        `${label} should forbid rebuilding note_url from note_id`
      );
      assert.match(
        skill,
        /complete 24-character lowercase hexadecimal ID exactly; do not pass or display only a prefix/,
        `${label} should require complete note_id reuse`
      );
    }

    const detailSkills = [
      ["npm/media-detail", "npm", "media-detail"],
      ["clawhub/xhs-detail", "clawhub", "socialdatax-xhs-detail"],
    ];
    for (const [label, host, slug] of detailSkills) {
      const skill = readGeneratedSkill(tempRoot, host, slug, source.hosts.hosts);
      assert.match(
        skill,
        /complete 24-character lowercase hexadecimal `note_id` returned/,
        `${label} should require complete note_id inputs`
      );
      assert.match(
        skill,
        /in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding/,
        `${label} should require exact detail note_url preservation`
      );
      assert.match(
        skill,
        /preserve it exactly as the full URL, including `xsec_token` query parameters/,
        `${label} should require preserving the full detail note_url`
      );
      assert.match(
        skill,
        /if `note_url` is null, show the `note_id` or say that no directly openable full link is available/,
        `${label} should keep nullable note_url guidance`
      );
      assert.doesNotMatch(
        skill,
        /preferred when the note ID|use when a note ID is already known/,
        `${label} should not keep weak note_id guidance`
      );
    }

    const noteIdOnlySkills = [
      ["npm/media-comments", "npm", "media-comments"],
      ["npm/media-user-posts", "npm", "media-user-posts"],
      ["clawhub/xhs-comments", "clawhub", "socialdatax-xhs-comments"],
      ["clawhub/xhs-creator-notes", "clawhub", "socialdatax-xhs-creator-notes"],
    ];
    for (const [label, host, slug] of noteIdOnlySkills) {
      const skill = readGeneratedSkill(tempRoot, host, slug, source.hosts.hosts);
      assert.match(
        skill,
        /complete 24-character lowercase hexadecimal/,
        `${label} should mention complete XHS note_id values`
      );
      assert.doesNotMatch(
        skill,
        /preferred when the note ID|use when the note ID is known|note ID and first-level comment ID/,
        `${label} should not keep weak note_id guidance`
      );
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated skills preserve opaque page tokens", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const skillTexts = Object.fromEntries(
      [
        ["npm/media-search", ["npm", "media-search"]],
        ["npm/media-detail", ["npm", "media-detail"]],
        ["npm/media-comments", ["npm", "media-comments"]],
        ["npm/media-user-posts", ["npm", "media-user-posts"]],
        [
          "npm/socialdatax-content-research-assistant",
          ["npm", "socialdatax-content-research-assistant"],
        ],
        ["clawhub/xhs-detail", ["clawhub", "socialdatax-xhs-detail"]],
        ["clawhub/xhs-search", ["clawhub", "socialdatax-xhs-search"]],
        ["clawhub/xhs-comments", ["clawhub", "socialdatax-xhs-comments"]],
        ["clawhub/xhs-creator-notes", ["clawhub", "socialdatax-xhs-creator-notes"]],
        ["clawhub/douyin-search", ["clawhub", "socialdatax-douyin-search"]],
        ["clawhub/kuaishou-search", ["clawhub", "socialdatax-kuaishou-search"]],
        ["skillhub/xhs-content", ["skillhub", "xhs-content-research-assistant"]],
        ["skillhub/all-content", ["skillhub", "socialdatax-content-research-assistant"]],
        ["skillhub/comments", ["skillhub", "socialdatax-comment-insights"]],
        ["skillhub/creator", ["skillhub", "socialdatax-creator-research"]],
      ].map(([label, [host, slug]]) => [
        label,
        readGeneratedSkill(tempRoot, host, slug, source.hosts.hosts),
      ])
    );

    for (const [label, skill] of Object.entries(skillTexts)) {
      if (!/page-token|page_token|next_page_token/.test(skill)) {
        continue;
      }
      assert.match(
        skill,
        /complete returned `next_page_token`/,
        `${label} should require complete next_page_token reuse`
      );
      assert.match(
        skill,
        /Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses/,
        `${label} should forbid summarizing opaque page tokens`
      );
      assert.doesNotMatch(
        skill,
        /pass back exactly the (?:token returned by the previous page|returned `next_page_token`)|optional opaque pagination token from the previous page|only with the returned token/,
        `${label} should not keep weaker page token guidance`
      );
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated skill files stay synchronized with the source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const listing of source.listings.listings) {
      assert.equal(
        readGeneratedSkill(tempRoot, listing.host, listing.slug, source.hosts.hosts),
        readRepoSkill(projectRoot, listing.host, listing.slug, source.hosts.hosts),
        `${listing.host}/${listing.slug} should match generated output`
      );
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generator warns about unmanaged skills without deleting them", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    const unmanagedSkill = join(
      tempRoot,
      source.hosts.hosts.clawhub.outputDir,
      "unmanaged-experiment",
      "SKILL.md"
    );
    mkdirSync(dirname(unmanagedSkill), { recursive: true });
    writeFileSync(unmanagedSkill, "manual experiment\n");

    const result = await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    assert.deepEqual(result.warnings, [
      "Unmanaged clawhub skill left unchanged: public-listings/socialdatax-openclaw-skills/unmanaged-experiment/SKILL.md",
    ]);
    assert.equal(readFileSync(unmanagedSkill, "utf8"), "manual experiment\n");
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generator does not write partial output when source validation fails", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[1].commands = ["xhs.missingCommand"];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Unknown command reference: xhs\.missingCommand/
    );
    assert.equal(
      existsSync(
        join(
          tempRoot,
          "public-listings",
          "socialdatax-openclaw-skills",
          "socialdatax-xhs",
          "SKILL.md"
        )
      ),
      false,
      "generation should not write earlier listings when a later listing is invalid"
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("npm installer skill registry stays aligned with npm listings and agent metadata", async () => {
  const source = await loadSkillSource({ repoRoot: projectRoot });
  const npmListingNames = source.listings.listings
    .filter((listing) => listing.host === "npm")
    .map((listing) => listing.slug)
    .sort();
  const skillNames = readdirSync(join(packageDir, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((skillName) => existsSync(join(packageDir, "skills", skillName, "SKILL.md")))
    .sort();
  const agentNames = readdirSync(join(packageDir, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((skillName) =>
      existsSync(join(packageDir, "skills", skillName, "agents", "openai.yaml"))
    )
    .sort();
  const cliNames = parseCliAvailableSkillNames(
    readFileSync(join(packageDir, "cli.mjs"), "utf8")
  );

  assert.deepEqual(skillNames, npmListingNames);
  assert.deepEqual(agentNames, npmListingNames);
  assert.deepEqual(cliNames, npmListingNames);

  for (const skillName of npmListingNames) {
    const agentSource = readFileSync(
      join(packageDir, "skills", skillName, "agents", "openai.yaml"),
      "utf8"
    );
    const displayName = parseSimpleYamlScalar(agentSource, "display_name");
    const shortDescription = parseSimpleYamlScalar(agentSource, "short_description");
    const defaultPrompt = parseSimpleYamlScalar(agentSource, "default_prompt");

    assert.ok(displayName.trim(), `${skillName} display_name should be non-empty`);
    assert.ok(shortDescription.trim(), `${skillName} short_description should be non-empty`);
    assert.match(
      defaultPrompt,
      new RegExp(`\\$${escapeRegExp(skillName)}\\b`),
      `${skillName} default_prompt should reference its installed skill`
    );
    assert.match(agentSource, /allow_implicit_invocation: true/);
  }
});

test("public listing checker does not hard-code generated skill slugs", async () => {
  const checker = readFileSync(
    join(projectRoot, "scripts", "check_public_listing_status.py"),
    "utf8"
  );
  const source = await loadSkillSource({ repoRoot: projectRoot });
  const generatedSlugs = source.listings.listings.map((listing) => listing.slug);
  const allowedLiteralSlugs = new Set([
    "socialdatax-opencli",
  ]);

  for (const slug of generatedSlugs) {
    if (allowedLiteralSlugs.has(slug)) {
      continue;
    }
    assert.doesNotMatch(
      checker,
      new RegExp(`["']${escapeRegExp(slug)}["']`),
      `check_public_listing_status.py should discover generated slug ${slug} from listings.json`
    );
    assert.doesNotMatch(
      checker,
      new RegExp(`${escapeRegExp(slug)}/(?:SKILL\\.md|agents/openai\\.yaml)`),
      `check_public_listing_status.py should not hard-code generated path for ${slug}`
    );
  }

  const requiredFunction = checker.match(
    /def required_public_files\(project_root: Path\) -> list\[str\]:([\s\S]*?)\n\ndef /
  );
  assert.ok(requiredFunction, "check_public_listing_status.py should define required_public_files");
  assert.match(
    requiredFunction[1],
    /generated_socialdatax_npm_agent_files\(project_root\)/,
    "required_public_files should include npm agent metadata discovered from listings.json"
  );
});

test("generator rejects malformed command references instead of truncating them", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].commands = ["xhs.search.extra"];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Invalid command reference format: xhs\.search\.extra/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects duplicate command references in capability defaults", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.capabilities.search.commands.push("xhs.search");
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /capability search commands must not contain duplicate value: xhs\.search/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects duplicate command references in listing overrides", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].commands = ["xhs.search", "xhs.search"];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /listing clawhub:socialdatax-xhs commands must not contain duplicate value: xhs\.search/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects overlapping commands and extraCommands", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].commands = ["xhs.search"];
    listings.listings[0].extraCommands = ["xhs.search"];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /listing clawhub:socialdatax-xhs commands and extraCommands must not overlap: xhs\.search/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects duplicate capabilities in listing configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].capability = undefined;
    delete listings.listings[0].capability;
    listings.listings[0].capabilities = ["search", "search"];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Listing clawhub:socialdatax-xhs capabilities must not contain duplicate value: search/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects listings whose commands resolve to empty arrays", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].commands = [];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Listing clawhub:socialdatax-xhs commands must resolve to a non-empty array/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects null command overrides instead of falling back to capability commands", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].commands = null;
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /listing clawhub:socialdatax-xhs commands must be an array/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects listings that mix capability shorthand and capabilities array", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].capabilities = ["xhs-hub"];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Listing clawhub:socialdatax-xhs must define either capability or capabilities, not both/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects unknown listing fields instead of silently ignoring typos", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].extraCommand = ["xhs.detailId"];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /listing clawhub:socialdatax-xhs has unknown field\(s\): extraCommand/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects unknown capability fields instead of silently ignoring typos", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.capabilities.search.extraCommand = ["xhs.detailId"];
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /capability search has unknown field\(s\): extraCommand/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects unknown MCP tool names in handwritten capability guidance", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.capabilities.search.mcpTools[0] =
      "If MCP tools are already available, call `xhs_search_note`.";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /capability search mcpTools references unknown MCP tool: xhs_search_note/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects wildcard MCP tool family names that match no known tools", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.capabilities.detail.currentSupport[0] =
      "XHS notes through the `xhs_get_note_detal_by_*` tools.";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /capability detail currentSupport references unknown MCP tool: xhs_get_note_detal_by_\*/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects unknown MCP tool names in handwritten listing guidance", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].mcpTools = [
      "If MCP tools are already available, call `douyin_search_video`.",
    ];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /listing clawhub:socialdatax-xhs mcpTools references unknown MCP tool: douyin_search_video/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects non-array guidance fields in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.capabilities.search.body = "not an array";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /capability search body must be an array/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects non-string guidance lines in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].mcpTools = [{ tool: "xhs_search_notes" }];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /listing clawhub:socialdatax-xhs mcpTools\[0\] must be a string/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects multiline guidance lines in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].mcpTools = [
      "If MCP tools are already available, call `xhs_search_notes`.\nDo not fold multiple guidance lines into one field.",
    ];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /listing clawhub:socialdatax-xhs mcpTools\[0\] must be a single-line string/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects whitespace-only guidance lines in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.capabilities.search.body = ["   "];
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /capability search body\[0\] must be empty or contain non-whitespace text/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects non-string platform CLI commands", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.platforms.xhs.commands.search = { command: "xhs search" };
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /platform xhs command search must be a non-empty single-line string/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects non-string platform MCP tools", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.platforms.xhs.tools.search = ["xhs_search_notes"];
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /platform xhs tool search must be a non-empty single-line string/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects unsupported package specs in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.packageSpec = "socialdatax-skills";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /catalog\.json packageSpec must be socialdatax-skills@latest/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects unsupported public API key env names in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.apiKeyEnv = "SOCIAL_MEDIA_MCP_API_KEY";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /catalog\.json apiKeyEnv must be SOCIALDATAX_API_KEY/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects public metadata env drift in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.metadata.requires.env = ["SOCIALDATAX_API_KEY", "SOCIAL_MEDIA_MCP_API_KEY"];
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /catalog\.json metadata\.requires\.env must be \["SOCIALDATAX_API_KEY"\]/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects public metadata bin drift in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.metadata.requires.bins = ["node", "npm", "bun"];
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /catalog\.json metadata\.requires\.bins must be \["node", "npm"\]/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects malformed common public copy in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.common.safetyBoundary = "";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /catalog\.json common\.safetyBoundary must be a non-empty single-line string/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects public metadata package drift in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.metadata.install[0].package = "social-media-insights-skills";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /catalog\.json metadata\.install\[0\]\.package must be socialdatax-skills/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects public metadata installer kind drift in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.metadata.install[0].kind = "bun";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /catalog\.json metadata\.install\[0\]\.kind must be node/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects public metadata installer bin drift in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.metadata.install[0].bins = ["socialdatax-skills"];
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /catalog\.json metadata\.install\[0\]\.bins must be empty/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects unknown host metadata styles", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const hostsPath = join(sourceDir, "hosts.json");
    const hosts = JSON.parse(readFileSync(hostsPath, "utf8"));
    hosts.hosts.npm.metadataStyle = "yml";
    writeFileSync(hostsPath, `${JSON.stringify(hosts, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Host npm metadataStyle must be inline-json or yaml/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects unsafe host output directories", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const hostsPath = join(sourceDir, "hosts.json");
    const hosts = JSON.parse(readFileSync(hostsPath, "utf8"));
    hosts.hosts.clawhub.outputDir = "../outside";
    writeFileSync(hostsPath, `${JSON.stringify(hosts, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Host clawhub outputDir must not contain empty, current, or parent path segments/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects normalized parent segments in host output directories", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const hostsPath = join(sourceDir, "hosts.json");
    const hosts = JSON.parse(readFileSync(hostsPath, "utf8"));
    hosts.hosts.clawhub.outputDir = "public-listings/tmp/../socialdatax-openclaw-skills";
    writeFileSync(hostsPath, `${JSON.stringify(hosts, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Host clawhub outputDir must not contain empty, current, or parent path segments/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects host output directories outside public-listings", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const hostsPath = join(sourceDir, "hosts.json");
    const hosts = JSON.parse(readFileSync(hostsPath, "utf8"));
    hosts.hosts.clawhub.outputDir = "tmp/generated-skills";
    writeFileSync(hostsPath, `${JSON.stringify(hosts, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Host clawhub outputDir must stay under public-listings/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects backslash host output directories", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const hostsPath = join(sourceDir, "hosts.json");
    const hosts = JSON.parse(readFileSync(hostsPath, "utf8"));
    hosts.hosts.clawhub.outputDir = "public-listings\\socialdatax-openclaw-skills";
    writeFileSync(hostsPath, `${JSON.stringify(hosts, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Host clawhub outputDir must use POSIX-style forward slashes/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects host homepage values without the expected attribution", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const hostsPath = join(sourceDir, "hosts.json");
    const hosts = JSON.parse(readFileSync(hostsPath, "utf8"));
    hosts.hosts.skillhub.homepage = "https://socialdatax.52choujiang.com/?from=clawhub";
    writeFileSync(hostsPath, `${JSON.stringify(hosts, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Host skillhub homepage must be https:\/\/socialdatax\.52choujiang\.com\/\?from=skillhub/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects non-string host metadata fields", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const hostsPath = join(sourceDir, "hosts.json");
    const hosts = JSON.parse(readFileSync(hostsPath, "utf8"));
    hosts.hosts.clawhub.homepage = ["https://socialdatax.52choujiang.com"];
    writeFileSync(hostsPath, `${JSON.stringify(hosts, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Host clawhub homepage must be a non-empty single-line string/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects unsafe listing slugs", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].slug = "../outside";
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Listing clawhub:\.\.\/outside slug must use lowercase letters, numbers, and hyphens only/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects unknown listing publish statuses", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].publishStatus = "ready";
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Listing clawhub:socialdatax-xhs publishStatus must be retained when set/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects malformed emoji metadata fields", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].emoji = { icon: "📕" };
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Listing clawhub:socialdatax-xhs emoji must be a non-empty single-line string/
    );

    listings.listings[0].emoji = "📕";
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.capabilities.search.emoji = "";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /capability search emoji must be a non-empty single-line string/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects non-string listing metadata fields", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = join(badRoot, "public-listings", "socialdatax-skill-source");
    mkdirSync(sourceDir, { recursive: true });
    for (const fileName of ["catalog.json", "hosts.json", "listings.json"]) {
      copyFileSync(
        join(projectRoot, "public-listings", "socialdatax-skill-source", fileName),
        join(sourceDir, fileName)
      );
    }

    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].description = ["not", "a", "string"];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Listing description must be a non-empty single-line string/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects multiline listing metadata fields", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].title = "小红书数据助手\nSocialDataX";
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Listing title must be a non-empty single-line string/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects whitespace-only listing metadata fields", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0].useWhen = "   ";
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Listing useWhen must be a non-empty single-line string/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects public brand drift in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.brand.english = "Social Media Data Assistant";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /catalog\.json brand\.english must be SocialDataX/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects unknown brand fields in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.brand.legacyEnglish = "Social Media Insights";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /catalog\.json brand has unknown field\(s\): legacyEnglish/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects platform tools without matching commands", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const catalogPath = join(sourceDir, "catalog.json");
    const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
    catalog.platforms.xhs.tools.detailByUrlTypo = "xhs_get_note_detail_by_note_url";
    writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /platform xhs tools contain key\(s\) without matching commands: detailByUrlTypo/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects malformed listing entries in source configuration", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

  try {
    const sourceDir = copySkillSourceTo(badRoot);
    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    listings.listings[0] = "socialdatax-xhs";
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /listings\.json listings\[0\] must be an object/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

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
  supportsAgentMetadata,
} from "../../../scripts/generate_socialdatax_skills.mjs";

const DEFAULT_PACKAGE_SPEC = "socialdatax-skills@latest";
const XHS_VIRAL_NOTE_RESEARCH_PACKAGE_SPEC = "socialdatax-skills@0.2.30";
const packageDir = dirname(dirname(fileURLToPath(import.meta.url)));
const projectRoot = resolve(packageDir, "..", "..");

function readGeneratedSkill(tempRoot, host, slug, hosts) {
  return readFileSync(
    join(tempRoot, hosts[host].outputDir, slug, "SKILL.md"),
    "utf8"
  );
}

function readGeneratedAgent(tempRoot, host, slug, hosts) {
  return readFileSync(
    join(tempRoot, hosts[host].outputDir, slug, "agents", "openai.yaml"),
    "utf8"
  );
}

function readRepoSkill(projectRoot, host, slug, hosts) {
  return readFileSync(
    join(projectRoot, hosts[host].outputDir, slug, "SKILL.md"),
    "utf8"
  );
}

function readRepoAgent(projectRoot, host, slug, hosts) {
  return readFileSync(
    join(projectRoot, hosts[host].outputDir, slug, "agents", "openai.yaml"),
    "utf8"
  );
}

function isChineseMarketHost(host) {
  return host === "skillhub" || host === "modelscope";
}

function isChineseRenderedListing(listing) {
  return (
    isChineseMarketHost(listing.host) ||
    (listing.host === "clawhub" && listing.slug === "socialdatax-sensitive-check")
  );
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countMatches(text, pattern) {
  return (text.match(pattern) ?? []).length;
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

function extractMarkdownSection(markdown, heading) {
  const lines = markdown.split("\n");
  const headingLine = `## ${heading}`;
  const start = lines.findIndex((line) => line === headingLine);
  assert.notEqual(start, -1, `markdown should include section ${heading}`);
  const collected = [];
  for (const line of lines.slice(start + 1)) {
    if (line.startsWith("## ") || line.startsWith("# ")) {
      break;
    }
    collected.push(line);
  }
  return collected.join("\n").trim();
}

function extractDirectCliExamples(markdown) {
  const examples = [];
  let inBashBlock = false;
  let current = [];

  const flushCurrent = () => {
    if (current.length === 0) {
      return;
    }
    examples.push(
      current
        .map((line) => line.trim().replace(/\\$/, "").trim())
        .filter(Boolean)
        .join(" ")
        .replace(/\s+/g, " ")
    );
    current = [];
  };

  for (const line of markdown.split("\n")) {
    if (line === "```bash") {
      inBashBlock = true;
      continue;
    }
    if (inBashBlock && line === "```") {
      flushCurrent();
      inBashBlock = false;
      continue;
    }
    if (!inBashBlock) {
      continue;
    }
    if (/^npx -y socialdatax-skills@\S+ /.test(line)) {
      flushCurrent();
      current = [line];
    } else if (current.length > 0 && line.trim() !== "") {
      current.push(line);
    }
  }
  flushCurrent();

  return examples;
}

function hasDirectCliExample(markdown, command) {
  return extractDirectCliExamples(markdown).some((example) =>
    new RegExp(`npx -y socialdatax-skills@\\S+ ${escapeRegExp(command)}`).test(
      example
    )
  );
}

function assertDirectCliExample(markdown, command, message) {
  assert.ok(
    hasDirectCliExample(markdown, command),
    message ?? `expected direct CLI example for ${command}`
  );
}

function assertNoDirectCliExample(markdown, command, message) {
  assert.equal(
    hasDirectCliExample(markdown, command),
    false,
    message ?? `expected no direct CLI example for ${command}`
  );
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

function expectedCliCommandForListing(catalog, listing, commandRef) {
  return (
    listing.commandExamples?.[commandRef] ??
    resolveCommandInfo(catalog, commandRef).command
  );
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
      assert.equal(frontmatterScalar(frontmatter, "source_client"), "socialdatax-skills");
      assert.equal(frontmatterScalar(frontmatter, "source_platform"), listing.host);
      assert.equal(frontmatterScalar(frontmatter, "source_skill"), listing.slug);
      assertJsonQuotedFrontmatterScalar(frontmatter, "description");
      assert.match(skill, /<!-- AUTO-GENERATED from socialdatax-skill-source/);
      assert.match(skill, /SOCIALDATAX_API_KEY/);
      assert.match(skill, new RegExp(escapeRegExp(host.homepage)));
      assert.match(skill, new RegExp(`\\?from=${escapeRegExp(listing.host)}`));
      assert.match(
        skill,
        /`insufficient_balance`|`insufficient_balance` 或“积分不足”/,
        `${listing.host}/${listing.slug} should document insufficient balance handling`
      );
      assert.match(
        skill,
        isChineseRenderedListing(listing)
          ? /把错误里的充值链接原样展示给用户/
          : /Show the recharge URL from the error exactly as returned/,
        `${listing.host}/${listing.slug} should tell agents to show the recharge URL`
      );
      assert.match(
        skill,
        isChineseRenderedListing(listing)
          ? /充值后继续(?:执行刚才)?(?:同一条命令|原命令)/
          : /continue the same command after the user recharges/,
        `${listing.host}/${listing.slug} should continue the same command after recharge`
      );
      assert.match(
        skill,
        isChineseRenderedListing(listing)
          ? /只读 skill|有限范围的数据分析任务/
          : /read-only|bounded(?: video speech-to-text)? analysis jobs/i
      );
      const attributionArgs =
        `--source-client socialdatax-skills --source-platform ${listing.host} --source-skill ${listing.slug}`;
      const directCliExamples = extractDirectCliExamples(skill);
      assert.ok(
        directCliExamples.length > 0,
        `${listing.host}/${listing.slug} should include direct CLI examples`
      );
      for (const command of directCliExamples) {
        assert.ok(
          command.includes(attributionArgs),
          `${listing.host}/${listing.slug} direct CLI example should include source attribution: ${command}`
        );
      }
      assert.match(
        skill,
        isChineseRenderedListing(listing)
          ? new RegExp(`- (?:可选：)?\`${escapeRegExp(attributionArgs)}\`：这是当前 Agent Skill 的来源标记`)
          : new RegExp(`- \`${escapeRegExp(attributionArgs)}\`: usage attribution`)
      );
      const expectedPackageSpec = listing.packageSpec ?? DEFAULT_PACKAGE_SPEC;
      assert.match(
        skill,
        new RegExp(`npx -y ${escapeRegExp(expectedPackageSpec)}`)
      );

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

    assert.doesNotMatch(
      xhsDetail,
      /Douyin|抖音|video\.play_url|aweme-id|Weibo|微博|WeChat Channels|视频号|post-id|encrypted-object-id/
    );
    assert.doesNotMatch(
      xhsCreatorNotes,
      /Douyin|抖音|short-drama|video playback URL|sec-user-id|Weibo|微博|WeChat Channels|视频号|post-id|finder-user-id/
    );
    assert.doesNotMatch(
      douyinSearch,
      /XHS|Xiaohongshu|小红书|RedNote|note type|Kuaishou|快手|photo-id|Weibo|微博|WeChat Channels|视频号|post-id|encrypted-object-id|\bnext_page\b/
    );
    assert.doesNotMatch(
      kuaishouSearch,
      /XHS|Xiaohongshu|小红书|RedNote|Douyin|抖音|note type|aweme-id|sec-user-id|short-drama|Weibo|微博|WeChat Channels|视频号|post-id|encrypted-object-id/
    );
    assert.doesNotMatch(
      kuaishouComments,
      /XHS|Xiaohongshu|小红书|RedNote|Douyin|抖音|note-id|aweme-id|video\.play_url|Weibo|微博|WeChat Channels|视频号|post-id|object-id/
    );
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
      const directCliExamples = extractDirectCliExamples(skill);

      for (const commandRef of commandRefsForListing(source.catalog, listing)) {
        const { tool } = resolveCommandInfo(source.catalog, commandRef);
        const command = expectedCliCommandForListing(
          source.catalog,
          listing,
          commandRef
        );

        assert.ok(
          directCliExamples.some((example) =>
            example.includes(
              `npx -y ${listing.packageSpec ?? DEFAULT_PACKAGE_SPEC} ${command}`
            )
          ),
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
      ["clawhub", "socialdatax-kuaishou"],
      ["skillhub", "short-video-topic-research"],
    ]) {
      const skill = readGeneratedSkill(tempRoot, host, slug, source.hosts.hosts);
      const chineseMarket = isChineseMarketHost(host);

      if (slug.includes("xhs")) {
        assertDirectCliExample(skill, "xhs hot-search --pretty");
        assert.match(skill, /`xhs_get_search_hot_list`/);
        assert.match(
          skill,
          chineseMarket
            ? /XHS `hot-search`：无必填参数。/
            : /XHS `hot-search`: no required arguments\./
        );
        if (host === "clawhub" && slug === "socialdatax-xhs") {
          assert.match(
            skill,
            /XHS comments `--sort-type <default\|time_descending\|like_count_descending>`/
          );
        }
      }
      if (slug.includes("douyin")) {
        assertDirectCliExample(skill, "douyin hot-search --pretty");
        assert.match(skill, /`douyin_get_hot_search_list`/);
        assert.match(
          skill,
          chineseMarket
            ? /Douyin `hot-search`：无必填参数。/
            : /Douyin `hot-search`: no required arguments\./
        );
        assert.match(
          skill,
          chineseMarket
            ? /Douyin `search --keyword <text>`：使用 `douyin search` 时必填/
            : /Douyin `search --keyword <text>`: required only when using `douyin search`/
        );
      }
      if (slug.includes("kuaishou") || slug === "short-video-topic-research") {
        assertDirectCliExample(skill, "kuaishou hot-search --pretty");
        assert.match(skill, /`kuaishou_get_hot_search_list`/);
        assert.match(
          skill,
          chineseMarket
            ? /(?:Kuaishou `hot-search`：无必填参数。|用户要看当前快手热榜时，使用 `kuaishou hot-search`，这个命令不需要 `--keyword`)/
            : /Kuaishou `hot-search`: no required arguments\./
        );
      }
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("clawhub scene entries use no-brand chinese titles and stable attribution", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const sceneEntries = [
      {
        slug: "xhs-content-research",
        title: "小红书内容研究",
        commands: ["xhs.search"],
        cli: ["xhs search --keyword"],
        forbiddenCli: ["xhs hot-search", "xhs detail", "xhs comments", "douyin transcript"],
        tools: ["xhs_search_notes"],
        forbiddenTools: ["xhs_get_search_hot_list", "xhs_get_note_comments", "douyin_"],
        output: [/样本表/, /完整原始 URL/, /完整 `note_id`/],
      },
      {
        slug: "xhs-comment-insights",
        title: "小红书评论分析与需求挖掘",
        commands: ["xhs.commentsId", "xhs.commentsUrl", "xhs.replies"],
        cli: [
          "xhs comments --note-id",
          "xhs comments --url",
          "xhs sub-comments --note-id",
        ],
        forbiddenCli: ["xhs search", "xhs detail", "douyin transcript"],
        tools: [
          "xhs_get_note_comments_by_note_id",
          "xhs_get_note_comments_by_note_url",
          "xhs_get_note_sub_comments_by_comment_id",
        ],
        forbiddenTools: ["xhs_search_notes", "douyin_"],
        output: [/用户痛点/, /未满足需求/, /FAQ/, /高频原话/],
      },
      {
        slug: "xhs-hot-topic-selection",
        title: "小红书热榜选题分析",
        commands: ["xhs.hotSearch", "xhs.search"],
        cli: ["xhs hot-search --pretty", "xhs search --keyword"],
        forbiddenCli: ["xhs detail", "xhs comments", "douyin transcript"],
        tools: ["xhs_get_search_hot_list", "xhs_search_notes"],
        forbiddenTools: ["xhs_get_note_comments", "douyin_"],
        output: [/热榜信号/, /选题候选池/, /热门笔记样本/],
      },
      {
        slug: "douyin-video-copy-extract",
        title: "抖音文案提取",
        commands: [
          "douyin.transcriptUrl",
          "douyin.transcriptId",
          "douyin.transcriptJob",
        ],
        cli: [
          "douyin transcript --url",
          "douyin transcript --aweme-id",
          "douyin transcript --job-id",
        ],
        forbiddenCli: ["douyin search", "douyin detail", "douyin comments", "xhs search"],
        tools: [
          "douyin_submit_video_speech_text_by_video_url",
          "douyin_submit_video_speech_text_by_aweme_id",
          "douyin_get_video_speech_text_job",
        ],
        forbiddenTools: ["xhs_", "kuaishou_", "weibo_", "wechat_"],
        output: [/原视频简介 `description`/, /口播逐字稿/, /任务状态/],
      },
    ];

    for (const entry of sceneEntries) {
      const listing = source.listings.listings.find(
        (candidate) =>
          candidate.host === "clawhub" && candidate.slug === entry.slug
      );
      assert.ok(listing, `source should include clawhub/${entry.slug}`);
      assert.equal(listing.title, entry.title);
      assert.doesNotMatch(listing.title, /SocialDataX/);
      assert.deepEqual(commandRefsForListing(source.catalog, listing), entry.commands);

      const skill = readGeneratedSkill(
        tempRoot,
        "clawhub",
        entry.slug,
        source.hosts.hosts
      );
      const frontmatter = extractFrontmatter(skill);
      assert.equal(frontmatterScalar(frontmatter, "name"), entry.slug);
      assert.equal(frontmatterScalar(frontmatter, "source_platform"), "clawhub");
      assert.equal(frontmatterScalar(frontmatter, "source_skill"), entry.slug);
      assert.match(skill, new RegExp(`^# ${escapeRegExp(entry.title)}$`, "m"));
      assert.doesNotMatch(skill, /^# .*SocialDataX/m);
      assert.match(skill, /https:\/\/socialdatax\.com\/ai\?from=clawhub/);
      assert.match(skill, /--source-platform clawhub/);
      assert.match(skill, new RegExp(`--source-skill ${escapeRegExp(entry.slug)}`));

      for (const command of entry.cli) {
        assertDirectCliExample(skill, command);
      }
      for (const command of entry.forbiddenCli) {
        assertNoDirectCliExample(skill, command);
      }

      const mcpTools = extractMarkdownSection(skill, "MCP Tools");
      for (const tool of entry.tools) {
        assert.match(mcpTools, new RegExp(`\\\`${escapeRegExp(tool)}\\\``));
      }
      for (const pattern of entry.forbiddenTools) {
        assert.doesNotMatch(mcpTools, new RegExp(pattern));
      }

      const output = extractMarkdownSection(skill, "Output Guidance");
      for (const pattern of entry.output) {
        assert.match(output, pattern);
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

    for (const command of [
      "xhs user-info --profile-url",
      "xhs user-posts --profile-url",
      "douyin user-info --profile-url",
      "douyin user-posts --profile-url",
      "douyin user-series --profile-url",
      "kuaishou user-info --profile-url",
      "kuaishou user-posts --profile-url",
    ]) {
      assertDirectCliExample(skill, command);
    }

    for (const pattern of [
      /`xhs_get_user_info_by_profile_url`/,
      /`xhs_get_user_posted_notes_by_profile_url`/,
      /`douyin_get_user_info_by_profile_url`/,
      /`douyin_get_user_posted_videos_by_profile_url`/,
      /`douyin_get_user_series_by_profile_url`/,
      /`kuaishou_get_user_info_by_profile_url`/,
      /`kuaishou_get_user_posted_videos_by_profile_url`/,
      /输出创作者资料时，优先写昵称|Report profile fields such as name/,
      /整理内容列表时，优先保留标题或描述|Summarize content-list evidence/,
      /如果用了抖音短剧合集命令|For Douyin short-drama series/,
    ]) {
      assert.match(skill, pattern);
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated media transcript skill documents direct CLI and MCP transcript jobs", async () => {
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
      "media-transcript",
      source.hosts.hosts
    );

    assert.match(skill, /speech-to-text transcript jobs/);
    assert.match(skill, /口播转文字/);
    assert.match(skill, /## Preferred Direct CLI/);
    assert.match(
      skill,
      /This skill can submit bounded video speech-to-text analysis jobs through the direct CLI or hosted MCP tools/
    );
    assert.doesNotMatch(skill, /This skill is read-only\./);
    assert.doesNotMatch(skill, /MCP-only/i);
    assert.doesNotMatch(skill, /not available through the direct CLI/i);

    const directCliExamples = extractDirectCliExamples(skill);
    for (const command of [
      "xhs transcript --url",
      "xhs transcript --note-id",
      "xhs transcript --job-id",
      "douyin transcript --url",
      "douyin transcript --aweme-id",
      "douyin transcript --job-id",
      "kuaishou transcript --url",
      "kuaishou transcript --photo-id",
      "kuaishou transcript --job-id",
      "weibo transcript --post-url",
      "weibo transcript --post-id",
      "weibo transcript --job-id",
      "wechat transcript --url",
      "wechat transcript --encrypted-object-id",
      "wechat transcript --job-id",
    ]) {
      assert.ok(
        directCliExamples.some((example) =>
          example.includes(`npx -y socialdatax-skills@latest ${command}`)
        ),
        `media-transcript should document ${command}`
      );
    }
    assert.match(skill, /--source-client socialdatax-skills/);
    assert.match(skill, /--source-platform npm/);
    assert.match(skill, /--source-skill media-transcript/);

    for (const tool of [
      "xhs_submit_video_speech_text_by_note_url",
      "xhs_submit_video_speech_text_by_note_id",
      "xhs_get_video_speech_text_job",
      "douyin_submit_video_speech_text_by_video_url",
      "douyin_submit_video_speech_text_by_aweme_id",
      "douyin_get_video_speech_text_job",
      "kuaishou_submit_video_speech_text_by_video_url",
      "kuaishou_submit_video_speech_text_by_photo_id",
      "kuaishou_get_video_speech_text_job",
      "weibo_submit_video_speech_text_by_post_url",
      "weibo_submit_video_speech_text_by_post_id",
      "weibo_get_video_speech_text_job",
      "wechat_submit_video_speech_text_by_video_url",
      "wechat_submit_video_speech_text_by_encrypted_object_id",
      "wechat_get_video_speech_text_job",
    ]) {
      assert.match(
        skill,
        new RegExp(`\\\`${escapeRegExp(tool)}\\\``),
        `media-transcript should document ${tool}`
      );
    }
    assert.match(
      skill,
      /Return the transcript text and content context when available; include content IDs, titles or descriptions, author facts, and duration when the response provides them\./
    );
    assert.match(
      skill,
      /This v1 surface does not return summary\./
    );
    assert.match(skill, /automatically wait and poll the same job by default/);
    assert.match(skill, /use positive `--max-wait-seconds <seconds>` to tune/);
    assert.doesNotMatch(skill, /--no-wait/);
    assert.match(skill, /call `data\.next_action\.tool_name` with `data\.next_action\.arguments` exactly as returned/);
    assert.match(skill, /bounded `wait_seconds` value/);
    assert.match(skill, /querying the same `job_id` until a terminal result is available/);
    assert.match(skill, /Continue until `is_terminal` is `true`/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated douyin video copy extraction skill stays douyin-only and transcript-focused", async () => {
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
      "douyin-video-copy-extract",
      source.hosts.hosts
    );

    assert.match(skill, /^# 抖音文案一键提取$/m);
    assert.doesNotMatch(skill, /^# .*SocialDataX/m);
    assert.match(skill, /抖音文案提取/);
    assert.match(skill, /抖音视频文案提取/);
    assert.match(skill, /抖音视频转文字/);
    assert.match(skill, /抖音口播转文字/);
    assert.match(skill, /提交抖音视频文案提取/);
    assert.match(skill, /获取视频基础信息、原视频简介、口播逐字稿、可复制文案和精简版/);
    assert.match(skill, /返回中可见的视频上下文/);
    assert.match(skill, /视频基础信息、原视频简介、口播逐字稿、可复制文案和精简版/);
    assert.doesNotMatch(skill, /视频简介、口播逐字稿或任务状态/);
    assert.doesNotMatch(skill, /可继续追问的角度/);
    assert.doesNotMatch(skill, /下一步可继续追问的问题/);
    assert.doesNotMatch(skill, /想继续分析/);
    assert.doesNotMatch(skill, /继续缩小范围/);

    const directCliExamples = extractDirectCliExamples(skill);
    for (const command of [
      "douyin transcript --url",
      "douyin transcript --aweme-id",
      "douyin transcript --job-id",
    ]) {
      assert.ok(
        directCliExamples.some((example) =>
          example.includes(`npx -y socialdatax-skills@latest ${command}`)
        ),
        `douyin-video-copy-extract should document ${command}`
      );
    }

    assert.match(skill, /--source-client socialdatax-skills/);
    assert.match(skill, /--source-platform skillhub/);
    assert.match(skill, /--source-skill douyin-video-copy-extract/);

    for (const tool of [
      "douyin_submit_video_speech_text_by_video_url",
      "douyin_submit_video_speech_text_by_aweme_id",
      "douyin_get_video_speech_text_job",
    ]) {
      assert.match(skill, new RegExp(`\\\`${escapeRegExp(tool)}\\\``));
    }

    const output = extractMarkdownSection(skill, "输出建议");
    assert.match(output, /固定输出结构/);
    assert.match(output, /按以下顺序组织/);
    assert.match(output, /1\. 视频基础信息/);
    assert.match(output, /标题、作者、发布时间、时长、aweme_id/);
    assert.match(output, /2\. 原视频简介/);
    assert.match(output, /`description`/);
    assert.match(output, /3\. 口播逐字稿/);
    assert.match(output, /4\. 可复制文案版/);
    assert.match(output, /5\. 精简版/);
    assert.match(output, /6\. 任务状态/);
    assert.match(output, /`job_id`/);
    assert.doesNotMatch(
      output,
      /下载视频|自动改写|保证爆款|封面制作|发布操作/
    );

    for (const forbidden of [
      "xhs_submit_video_speech_text",
      "kuaishou_submit_video_speech_text",
      "weibo_submit_video_speech_text",
      "wechat_submit_video_speech_text",
      "视频号",
      "WeChat Channels",
      "评论洞察",
      "爆款分析",
      "脚本改写",
      "This v1 surface does not return summary",
    ]) {
      assert.doesNotMatch(skill, new RegExp(escapeRegExp(forbidden)));
    }

    assert.match(skill, /文案提取 \/ 转写：/);
    assert.match(skill, /输入：`--url <douyin_video_url_or_share_text>`/);
    assert.match(skill, /输入：`--aweme-id <aweme_id>`/);
    assert.match(skill, /输入：`--job-id <job_id>`/);
    assert.doesNotMatch(skill, /必填：`--url <douyin_video_url_or_share_text>`/);
    assert.doesNotMatch(skill, /必填：`--aweme-id <aweme_id>`/);
    assert.doesNotMatch(skill, /必填：`--job-id <job_id>`/);
    assert.match(skill, /`description`/);
    assert.match(skill, /标题、作者、发布时间、时长、aweme_id、原始链接等；只有返回中存在时才输出/);
    assert.match(skill, /口播逐字稿/);
    assert.match(skill, /可复制文案/);
    assert.match(skill, /执行步骤：第一步/);
    assert.match(skill, /第二步，先看返回 JSON 里的 `data\.is_terminal`/);
    assert.match(skill, /如果不是 `true`，复制同一个 `data\.job_id`/);
    assert.match(skill, /第三步，只有 `data\.is_terminal` 是 `true` 时才交付结果/);
    assert.match(skill, /循环规则：每次查询返回后都先判断 `data\.is_terminal`/);
    assert.match(skill, /只要 `data\.is_terminal` 不是 `true`，就继续查询同一个 `data\.job_id`/);
    assert.match(skill, /停止条件只有三类：终态、工具无法继续运行、用户要求停止/);
    assert.match(skill, /复制同一个 `data\.job_id`/);
    assert.match(skill, /运行上方 `douyin transcript --job-id <job_id>` 命令继续查询/);
    assert.match(skill, /提交动作最多一次/);
    assert.match(skill, /不要提前写最终文案/);
    assert.match(skill, /不要把只有 `data\.job_id` 的内容当作最终结果/);
    assert.match(skill, /只有 `data\.is_terminal` 是 `true` 且 `data\.status` 是 `succeeded` 时才输出逐字稿/);
    assert.match(skill, /失败时先看 `data\.error\.retryable`/);
    assert.match(skill, /只有值为 `true` 才建议稍后重试/);
    assert.match(skill, /值为 `false` 时说明当前视频不适合重复提交/);
    assert.match(skill, /只有工具无法继续运行、会话被中断或用户要求停止时，才输出 `data\.job_id`、`data\.status` 和 `data\.next_action`/);
    assert.match(skill, /如果提交失败且没有返回 `data\.job_id`/);
    assert.match(skill, /如果已经拿到 `data\.job_id`，后续异常只查询同一个任务/);
    assert.match(skill, /调用失败：如果已有 `job_id`，只查询同一个任务/);
    assert.match(skill, /如果返回 `insufficient_balance` 或“积分不足”/);
    assert.match(skill, /把错误里的充值链接原样展示给用户/);
    assert.match(skill, /充值后继续执行刚才同一条命令/);
    assert.match(skill, /充值后继续原命令，不要反复重试/);
    assert.doesNotMatch(skill, /原样重试一次/);
    assert.doesNotMatch(skill, /调用失败：先确认 `SOCIALDATAX_API_KEY` 已配置，再重试/);
    assert.doesNotMatch(skill, /标题作者/);
    assert.doesNotMatch(skill, /作者等上下文/);
    assert.doesNotMatch(skill, /作者、时长、口播逐字稿/);
    assert.doesNotMatch(skill, /60 秒|12 次/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated sensitive-check skills expose text check CLI and MCP tool", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    assert.ok(
      source.catalog.platforms["sensitive-check"],
      "catalog should include sensitive-check platform"
    );
    resolveCommandInfo(source.catalog, "sensitive-check.text");

    const npmSkill = readGeneratedSkill(
      tempRoot,
      "npm",
      "sensitive-check",
      source.hosts.hosts
    );
    const skillhubSkill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "socialdatax-sensitive-check",
      source.hosts.hosts
    );
    const clawhubSkill = readGeneratedSkill(
      tempRoot,
      "clawhub",
      "socialdatax-sensitive-check",
      source.hosts.hosts
    );

    for (const [host, skill] of [
      ["npm", npmSkill],
      ["skillhub", skillhubSkill],
      ["clawhub", clawhubSkill],
    ]) {
      assert.match(skill, /敏感词检测与违禁词检查/);
      assert.match(skill, /敏感词检测/);
      assert.match(skill, /违禁词/);
      assert.match(skill, /SOCIALDATAX_API_KEY/);
      assertDirectCliExample(
        skill,
        'sensitive-check text --text "<content>" --platform xhs --pretty'
      );
      assert.match(skill, /`check_sensitive_text`/);
      assert.match(skill, /generic/);
      assert.match(skill, /xhs/);
      assert.match(skill, /douyin/);
      assert.match(skill, /kuaishou/);
      assert.match(
        skill,
        host === "npm"
          ? /The command prints JSON with `platform`, `tool`, and `data`; it does not echo the original text back in CLI arguments\./
          : /命令返回 JSON，包含 `platform`、`tool` 和 `data`/
      );
      assert.match(
        skill,
        host === "npm"
          ? /SocialDataX service records the submitted text and structured detection result/
          : /服务端会保存提交文本和结构化检测结果/
      );
      assert.doesNotMatch(
        skill,
        /The command prints JSON with `platform`, `tool`, `arguments`, and `data`\./
      );
      assert.doesNotMatch(skill, /SOCIAL_MEDIA_MCP_API_KEY/);
      assert.doesNotMatch(skill, /Social Media Data Assistant/);
      assert.doesNotMatch(skill, /52choujiang\.com\/assistant/);
    }

    for (const skill of [skillhubSkill, clawhubSkill]) {
      assert.match(skill, /## 快速开始/);
      assert.match(skill, /## 示例结果/);
      assert.match(skill, /文本/);
      assert.doesNotMatch(skill, /## Preferred Direct CLI/);
      assert.doesNotMatch(skill, /Required arguments:/);
      assert.doesNotMatch(skill, /Service note:/);
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
    ["skillhub/socialdatax-content-research-assistant", 340],
    ["skillhub/short-video-topic-research", 270],
    ["skillhub/xhs-content-research-assistant", 165],
    ["skillhub/socialdatax-creator-research", 185],
    ["npm/socialdatax-content-research-assistant", 490],
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

test("skillhub generated skills include quick start result examples and troubleshooting guidance", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const slug of [
      "socialdatax-xhs-topic-analysis",
      "socialdatax-content-insights",
      "xhs-topic-analysis-v2",
      "short-video-topic-research",
      "socialdatax-creator-research",
    ]) {
      const listing = source.listings.listings.find(
        (candidate) => candidate.host === "skillhub" && candidate.slug === slug
      );
      assert.ok(listing, `source should include skillhub/${slug}`);

      const skill = readGeneratedSkill(
        tempRoot,
        "skillhub",
        slug,
        source.hosts.hosts
      );
      assert.match(skill, /## 快速开始/);
      assert.match(skill, /## 示例结果/);
      assert.match(skill, /## 异常处理/);
      assert.match(skill, /## 常见问题/);
      assert.match(skill, /先给出当前 skill 支持的输入/);
      assert.match(skill, /你通常会得到：/);
      assert.match(skill, /示例展示格式，不代表固定字段/);
      assert.match(skill, /网络或 API 异常：保留错误信息/);
      assert.match(skill, /如果返回 `insufficient_balance` 或“积分不足”/);
      assert.match(skill, /把错误里的充值链接原样展示给用户/);
      assert.match(skill, /充值后继续执行刚才同一条命令/);
      assert.match(skill, /重试仍失败：说明当前调用不可用/);
      assert.match(skill, /没结果：/);
      assert.match(skill, /调用失败：先确认 `SOCIALDATAX_API_KEY` 已配置；如果是 `insufficient_balance` 或“积分不足”/);
      assert.match(skill, /充值后继续原命令，不要反复重试/);
      assert.match(skill, /优先输出可直接复盘的结果/);
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("skillhub generated skills keep user-facing sections in a natural order", async () => {
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
      "xhs-content-research",
      source.hosts.hosts
    );
    const sectionOrder = [
      "## 适用场景",
      "## 快速开始",
      "## API Key 获取",
      "## 直接调用命令",
      "## 参数说明",
      "## 输出建议",
      "## MCP 工具",
      "## 安全边界",
      "## 示例结果",
      "## 异常处理",
      "## 常见问题",
    ];
    const positions = sectionOrder.map((heading) => {
      const index = skill.indexOf(heading);
      assert.notEqual(index, -1, `skill should include ${heading}`);
      return index;
    });
    assert.deepEqual(
      positions,
      [...positions].sort((left, right) => left - right),
      "SkillHub body should lead with use case, setup, commands, and output guidance before support material"
    );
    assert.doesNotMatch(
      skill.split("## 适用场景", 2)[0],
      /Use this skill when/,
      "SkillHub top body should not show English useWhen before the Chinese use case section"
    );

    const aggregateSkill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "socialdatax-content-research-assistant",
      source.hosts.hosts
    );
    assert.doesNotMatch(
      aggregateSkill,
      /Current platform support:/,
      "SkillHub body should not put duplicate English support inventory in the user-facing flow"
    );
    const apiKeySection = aggregateSkill.split("## API Key 获取", 2)[1];
    assert.ok(apiKeySection, "aggregate SkillHub body should include API Key 获取");
    assert.match(
      apiKeySection,
      /获取或管理 API Key：访问 <https:\/\/socialdatax\.com\/ai\?from=skillhub>/
    );
    assert.doesNotMatch(
      extractMarkdownSection(aggregateSkill, "API Key 获取"),
      /Official API access|The only official website/,
      "SkillHub API key copy should stay Chinese-only in the user-facing section"
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("chinese-market generated skills keep chinese-first guidance copy", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const [host, slug] of [
      ["skillhub", "socialdatax-content-research-assistant"],
      ["skillhub", "socialdatax-sensitive-check"],
      ["modelscope", "xhs-content-research-assistant"],
    ]) {
      const skill = readGeneratedSkill(tempRoot, host, slug, source.hosts.hosts);

      assert.doesNotMatch(
        skill,
        /## Choose The Platform|## Choose The Narrowest Entry/,
        `${host}/${slug} should not expose english body headings in chinese markets`
      );
      assert.doesNotMatch(
        skill,
        /The command prints JSON with `platform`, `tool`, `arguments`, and `data`\./,
        `${host}/${slug} should not keep english json-shape narration in chinese markets`
      );
    }

    const aggregateSkill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "socialdatax-content-research-assistant",
      source.hosts.hosts
    );
    assert.match(aggregateSkill, /## 平台选择/);
    assert.match(aggregateSkill, /## 如何选入口/);
    assert.match(
      aggregateSkill,
      /优先使用最贴近用户任务的 direct CLI 命令，不要把所有需求都塞回关键词搜索。/
    );
    assert.match(
      aggregateSkill,
      /- 可选：`--page-token <next_page_token>`：|- 可选：搜索翻页时，如果返回了 `next_page_token`，再使用 `--page-token <next_page_token>`/
    );
    assert.match(
      aggregateSkill,
      /- 条件必填：`--comment-id <comment_id>`：回复 ?\/ ?子评论命令必填/
    );
    assert.match(
      aggregateSkill,
      /按平台分开整理事实证据，再补充你的判断/
    );

    const modelscopeAggregateSkill = readGeneratedSkill(
      tempRoot,
      "modelscope",
      "xhs-content-research-assistant",
      source.hosts.hosts
    );
    const modelscopeArgSection = extractMarkdownSection(
      modelscopeAggregateSkill,
      "参数说明"
    );
    assert.equal(
      countMatches(modelscopeArgSection, /`--pretty`：只影响输出格式/g),
      1,
      "ModelScope aggregate XHS assistant should not repeat --pretty guidance"
    );
    assert.ok(
      countMatches(modelscopeArgSection, /XHS `--note-id <note_id>`/g) <= 1,
      "ModelScope aggregate XHS assistant should not repeat note-id guidance"
    );
    assert.equal(
      countMatches(modelscopeAggregateSkill, /命令返回 JSON，包含 `platform`、`tool`、`arguments` 和 `data`/g),
      1,
      "ModelScope aggregate XHS assistant should keep only one direct CLI JSON-shape summary"
    );

    const sensitiveSkill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "socialdatax-sensitive-check",
      source.hosts.hosts
    );
    assert.doesNotMatch(
      sensitiveSkill,
      /Use this skill when the user wants 敏感检测/
    );
    assert.match(
      sensitiveSkill,
      /命令返回 JSON，包含 `platform`、`tool` 和 `data`/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("chinese-market generated skills do not expose untranslated english guidance", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const untranslatedEnglishLine =
    /(^|\n)(The command|Search supports|Multi-page|Kuaishou search|For Kuaishou|For Douyin|For Weibo|For XHS|Do not|Continue Kuaishou|Use `|Separate XHS|For creators|For hot-search|If MCP|Report |Summarize |Group comments|Comment pagination|Creator content-list|Detail access|Empty comments|This skill|Generated Skill files|Use hosted MCP|It does not read)[^\n]*/;
  const untranslatedColonGuidance =
    /: (use|optional|required|opaque|continue|apply|keep|stop|fetch|output|default|no required|current|include|preferred|pass|copy|return|call|with|without|only|preserve|supports)\b/;

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const listing of source.listings.listings) {
      if (!isChineseMarketHost(listing.host)) {
        continue;
      }
      const skill = readGeneratedSkill(
        tempRoot,
        listing.host,
        listing.slug,
        source.hosts.hosts
      );

      assert.doesNotMatch(
        skill,
        untranslatedEnglishLine,
        `${listing.host}/${listing.slug} should localize chinese-market prose guidance`
      );
      assert.doesNotMatch(
        skill,
        untranslatedColonGuidance,
        `${listing.host}/${listing.slug} should localize english colon-style argument guidance`
      );
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("chinese-market generated skill titles hide compatibility v2 suffixes", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const listing of source.listings.listings) {
      if (!isChineseMarketHost(listing.host) || !listing.slug.endsWith("-v2")) {
        continue;
      }

      const skill = readGeneratedSkill(
        tempRoot,
        listing.host,
        listing.slug,
        source.hosts.hosts
      );
      const title = skill.match(/^# (.+)$/m)?.[1] ?? "";
      assert.doesNotMatch(
        title,
        /\bv2\b/i,
        `${listing.host}/${listing.slug} visible title should not expose compatibility suffix`
      );
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("chinese-market generated API key copy stays concise and chinese-first", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const [host, slug] of [
      ["skillhub", "socialdatax-content-research-assistant"],
      ["skillhub", "socialdatax-sensitive-check"],
      ["modelscope", "xhs-content-research-assistant"],
    ]) {
      const skill = readGeneratedSkill(tempRoot, host, slug, source.hosts.hosts);
      const apiKeySection = extractMarkdownSection(skill, "API Key 获取");

      assert.match(apiKeySection, /获取或管理 API Key：访问/);
      assert.match(apiKeySection, /`SOCIALDATAX_API_KEY`/);
      assert.doesNotMatch(
        apiKeySection,
        /Official API access|The only official website for requesting or managing API access is/,
        `${host}/${slug} should not keep english API key copy in chinese markets`
      );

      const safetySection = extractMarkdownSection(skill, "安全边界");
      assert.match(safetySection, /这是只读 skill|这个 skill 只能提交有限范围的数据分析任务/);
      assert.match(safetySection, /运行时使用用户环境变量中的 `SOCIALDATAX_API_KEY`|当前 Agent 已认证的 MCP 访问能力/);
      assert.match(safetySection, /生成的 Skill 文件不包含 API Key/);
      assert.doesNotMatch(
        safetySection,
        /This skill|Generated Skill files|It does not read/,
        `${host}/${slug} should localize the safety boundary in chinese markets`
      );
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("modelscope agent metadata stays chinese-first", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const listing of source.listings.listings) {
      if (listing.host !== "modelscope") {
        continue;
      }

      const agent = readGeneratedAgent(
        tempRoot,
        listing.host,
        listing.slug,
        source.hosts.hosts
      );
      const displayName = parseSimpleYamlScalar(agent, "display_name");
      const shortDescription = parseSimpleYamlScalar(agent, "short_description");
      const defaultPrompt = parseSimpleYamlScalar(agent, "default_prompt");

      const commandRefs = commandRefsForListing(source.catalog, listing);
      const platformTerm = commandRefs.some((commandRef) =>
        commandRef.startsWith("douyin.")
      )
        ? /抖音/
        : /小红书/;

      assert.match(displayName, platformTerm);
      assert.match(shortDescription, platformTerm);
      assert.match(defaultPrompt, platformTerm);
      assert.match(defaultPrompt, new RegExp(`\\$${escapeRegExp(listing.slug)}`));
      assert.doesNotMatch(
        defaultPrompt,
        /^Use \$/i,
        `${listing.host}/${listing.slug} should not expose an English default prompt`
      );
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("modelscope agent metadata fallback prompt stays chinese-first", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-modelscope-agent-"));

  try {
    copySkillSourceTo(badRoot);
    const listingsPath = join(
      badRoot,
      "public-listings",
      "socialdatax-skill-source",
      "listings.json"
    );
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    const modelscopeListing = listings.listings.find(
      (listing) =>
        listing.host === "modelscope" &&
        listing.slug === "xhs-content-research"
    );
    assert.ok(modelscopeListing, "should find modelscope content skill listing");
    delete modelscopeListing.agentDefaultPrompt;
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    const source = await loadSkillSource({ repoRoot: badRoot });
    await generateSkills({
      repoRoot: badRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const agent = readGeneratedAgent(
      tempRoot,
      "modelscope",
      "xhs-content-research",
      source.hosts.hosts
    );
    const defaultPrompt = parseSimpleYamlScalar(agent, "default_prompt");
    assert.match(defaultPrompt, /当用户请求匹配 小红书内容研究/);
    assert.match(defaultPrompt, /\$xhs-content-research/);
    assert.doesNotMatch(defaultPrompt, /^Use \$/i);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("modelscope high-intent scene entries keep scoped commands and attribution", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const sceneEntries = [
      {
        slug: "xhs-comment-insights",
        title: "小红书评论分析与需求挖掘",
        commands: ["xhs.commentsId", "xhs.commentsUrl", "xhs.replies"],
        cli: [
          "xhs comments --note-id",
          "xhs comments --url",
          "xhs sub-comments --note-id",
        ],
        forbiddenCli: ["xhs search", "xhs detail", "douyin transcript"],
        tools: [
          "xhs_get_note_comments_by_note_id",
          "xhs_get_note_comments_by_note_url",
          "xhs_get_note_sub_comments_by_comment_id",
        ],
        forbiddenTools: ["xhs_search_notes", "douyin_"],
        output: [/用户痛点/, /未满足需求/, /FAQ/, /高频原话/],
      },
      {
        slug: "xhs-viral-note-research",
        title: "小红书爆款笔记研究",
        commands: ["xhs.search"],
        cli: ["xhs search --keyword"],
        forbiddenCli: ["xhs detail", "xhs comments", "douyin transcript"],
        tools: ["xhs_search_notes"],
        forbiddenTools: ["xhs_get_note_detail", "xhs_get_note_comments", "douyin_"],
        output: [/样本研究报告/, /标题钩子/, /完整原始 URL/],
      },
      {
        slug: "xhs-viral-copy-breakdown",
        title: "小红书爆款文案拆解",
        commands: ["xhs.search", "xhs.detailId", "xhs.detailUrl"],
        cli: [
          "xhs search --keyword",
          "xhs detail --note-id",
          "xhs detail --url",
        ],
        forbiddenCli: ["xhs comments", "douyin transcript"],
        tools: [
          "xhs_search_notes",
          "xhs_get_note_detail_by_note_id",
          "xhs_get_note_detail_by_note_url",
        ],
        forbiddenTools: ["xhs_get_note_comments", "douyin_"],
        output: [/文案拆解报告/, /标题钩子/, /可复用文案框架/],
      },
      {
        slug: "xhs-hot-topic-selection",
        title: "小红书热榜选题分析",
        commands: ["xhs.hotSearch", "xhs.search"],
        cli: ["xhs hot-search --pretty", "xhs search --keyword"],
        forbiddenCli: ["xhs detail", "xhs comments", "douyin transcript"],
        tools: ["xhs_get_search_hot_list", "xhs_search_notes"],
        forbiddenTools: ["xhs_get_note_comments", "douyin_"],
        output: [/热榜信号/, /选题候选池/, /热门笔记样本/],
      },
      {
        slug: "douyin-video-copy-extract",
        title: "抖音文案提取",
        commands: [
          "douyin.transcriptUrl",
          "douyin.transcriptId",
          "douyin.transcriptJob",
        ],
        cli: [
          "douyin transcript --url",
          "douyin transcript --aweme-id",
          "douyin transcript --job-id",
        ],
        forbiddenCli: ["douyin search", "douyin detail", "douyin comments", "xhs search"],
        tools: [
          "douyin_submit_video_speech_text_by_video_url",
          "douyin_submit_video_speech_text_by_aweme_id",
          "douyin_get_video_speech_text_job",
        ],
        forbiddenTools: ["xhs_", "kuaishou_", "weibo_", "wechat_"],
        output: [/原视频简介/, /口播逐字稿/, /同一个 `data\.job_id` 继续查询/],
      },
    ];

    for (const entry of sceneEntries) {
      const listing = source.listings.listings.find(
        (candidate) =>
          candidate.host === "modelscope" && candidate.slug === entry.slug
      );
      assert.ok(listing, `source should include modelscope/${entry.slug}`);
      assert.equal(listing.title, entry.title);
      assert.deepEqual(commandRefsForListing(source.catalog, listing), entry.commands);

      const skill = readGeneratedSkill(
        tempRoot,
        "modelscope",
        entry.slug,
        source.hosts.hosts
      );
      const agent = readGeneratedAgent(
        tempRoot,
        "modelscope",
        entry.slug,
        source.hosts.hosts
      );
      const frontmatter = extractFrontmatter(skill);
      assert.equal(frontmatterScalar(frontmatter, "name"), entry.slug);
      assert.equal(frontmatterScalar(frontmatter, "source_platform"), "modelscope");
      assert.equal(frontmatterScalar(frontmatter, "source_skill"), entry.slug);
      assert.match(skill, new RegExp(`^# ${escapeRegExp(entry.title)}$`, "m"));
      assert.match(skill, /https:\/\/socialdatax\.com\/ai\?from=modelscope/);
      assert.match(skill, /--source-platform modelscope/);
      assert.match(skill, new RegExp(`--source-skill ${escapeRegExp(entry.slug)}`));
      assert.match(
        parseSimpleYamlScalar(agent, "default_prompt"),
        new RegExp(`\\$${escapeRegExp(entry.slug)}`)
      );

      for (const command of entry.cli) {
        assertDirectCliExample(skill, command);
      }
      for (const command of entry.forbiddenCli) {
        assertNoDirectCliExample(skill, command);
      }

      const mcpTools = extractMarkdownSection(skill, "MCP 工具");
      for (const tool of entry.tools) {
        assert.match(mcpTools, new RegExp(`\\\`${escapeRegExp(tool)}\\\``));
      }
      for (const pattern of entry.forbiddenTools) {
        assert.doesNotMatch(mcpTools, new RegExp(pattern));
      }

      const output = extractMarkdownSection(skill, "输出建议");
      for (const pattern of entry.output) {
        assert.match(output, pattern);
      }
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("complex chinese-market skills group parameter guidance by workflow", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const [host, slug] of [
      ["skillhub", "socialdatax-content-research-assistant"],
      ["skillhub", "socialdatax-creator-research"],
      ["modelscope", "xhs-content-research-assistant"],
    ]) {
      const skill = readGeneratedSkill(tempRoot, host, slug, source.hosts.hosts);
      const argSection = extractMarkdownSection(skill, "参数说明");

      assert.match(argSection, /热榜：|搜索：|创作者 ?\/ ?账号：|详情 ?\/ ?评论：/);
      assert.match(argSection, /通用：/);
      assert.match(
        argSection,
        /`--source-client socialdatax-skills --source-platform/,
        `${host}/${slug} should keep source attribution guidance in the shared group`
      );
    }

    const aggregateArgSection = extractMarkdownSection(
      readGeneratedSkill(
        tempRoot,
        "skillhub",
        "socialdatax-content-research-assistant",
        source.hosts.hosts
      ),
      "参数说明"
    );
    assert.match(aggregateArgSection, /热榜：/);
    assert.match(aggregateArgSection, /搜索：/);
    assert.match(aggregateArgSection, /详情 ?\/ ?评论：/);
    assert.match(aggregateArgSection, /创作者 ?\/ ?账号：/);
    assert.match(aggregateArgSection, /`--comment-id <comment_id>`/);
    assert.doesNotMatch(
      aggregateArgSection,
      /^搜索 \/ 热榜：$/m,
      "distinct capabilities should not share a combined parameter heading"
    );
    for (const heading of ["热榜：", "搜索：", "详情 / 评论：", "创作者 / 账号：", "通用："]) {
      assert.equal(
        countMatches(
          aggregateArgSection,
          new RegExp(`^${escapeRegExp(heading)}$`, "gm")
        ),
        1,
        `parameter workflow heading should render once: ${heading}`
      );
    }
    assert.match(
      aggregateArgSection,
      /详情 ?\/ ?评论：[\s\S]*做详情、评论、回复命令/,
      "detail/comment ID-or-URL guidance should stay in the detail/comment group"
    );
    assert.match(
      aggregateArgSection,
      /创作者 ?\/ ?账号：[\s\S]*做创作者资料、内容列表或合集列表命令/,
      "creator profile/content guidance should stay in the creator/account group"
    );
    assert.match(
      aggregateArgSection,
      /热榜：[\s\S]*用户要看当前微博热搜/,
      "Weibo hot-search guidance should stay in the hot-list group"
    );
    assert.match(
      aggregateArgSection,
      /搜索：[\s\S]*(?:`--keyword <text>`|search --keyword <text>)/,
      "keyword guidance should stay in the search group"
    );
    assert.doesNotMatch(
      aggregateArgSection,
      /创作者 ?\/ ?账号：[\s\S]*做详情、评论、回复、创作者资料/,
      "mixed detail/comment/creator guidance should be split before grouping"
    );

    const commentArgSection = extractMarkdownSection(
      readGeneratedSkill(
        tempRoot,
        "skillhub",
        "socialdatax-comment-insights",
        source.hosts.hosts
      ),
      "参数说明"
    );
    assert.match(
      commentArgSection,
      /详情 ?\/ ?评论：[\s\S]*XHS `--note-id <note_id>`/,
      "content IDs returned from creator lists should still stay in the detail/comment group"
    );
    assert.doesNotMatch(
      commentArgSection,
      /创作者 ?\/ ?账号：[\s\S]*XHS `--note-id <note_id>`/,
      "content ID guidance should not be grouped as creator/account guidance"
    );
    assert.match(
      commentArgSection,
      /详情 ?\/ ?评论：[\s\S]*`--pages <n>`：获取并合并 N 页一级评论或回复/,
      "comment pagination guidance should stay in the detail/comment group"
    );
    assert.doesNotMatch(
      commentArgSection,
      /搜索：[\s\S]*`--pages <n>`：获取并合并 N 页一级评论或回复/,
      "comment pagination guidance should not be grouped as search guidance"
    );
    assert.doesNotMatch(
      commentArgSection,
      /热榜：[\s\S]*`--pages <n>`：获取并合并 N 页一级评论或回复/,
      "comment pagination guidance should not be grouped as hot-list guidance"
    );

    const searchArgSection = extractMarkdownSection(
      readGeneratedSkill(
        tempRoot,
        "skillhub",
        "xhs-content-research",
        source.hosts.hosts
      ),
      "参数说明"
    );
    assert.match(
      searchArgSection,
      /^搜索：[\s\S]*`--keyword <text>`/m,
      "keyword guidance should stay in the search-only group for search-only skills"
    );
    assert.equal(
      countMatches(searchArgSection, /^搜索：$/gm),
      1,
      "single-intent search skills should render the search-only parameter heading once"
    );
    assert.doesNotMatch(
      searchArgSection,
      /^搜索 \/ 热榜：$|^热榜：$/m,
      "single-intent search skills should not imply hot-search support"
    );
    assert.doesNotMatch(
      searchArgSection,
      /通用：[\s\S]*`--keyword <text>`/,
      "keyword guidance should not be grouped as generic guidance"
    );

    const trendArgSection = extractMarkdownSection(
      readGeneratedSkill(
        tempRoot,
        "skillhub",
        "xhs-trend-insights",
        source.hosts.hosts
      ),
      "参数说明"
    );
    assert.match(
      trendArgSection,
      /^热榜：[\s\S]*`hot-search`：无必填参数。/m,
      "hot-search guidance should stay in the hot-list group"
    );
    assert.match(
      trendArgSection,
      /^搜索：[\s\S]*`--keyword <text>`/m,
      "search guidance should stay in the search group"
    );
    assert.doesNotMatch(
      trendArgSection,
      /^搜索 \/ 热榜：$/m,
      "skills with both search and hot-search should split parameter headings"
    );

    const mixedPaginationArgSection = extractMarkdownSection(
      readGeneratedSkill(
        tempRoot,
        "modelscope",
        "xhs-content-research-assistant",
        source.hosts.hosts
      ),
      "参数说明"
    );
    assert.match(
      mixedPaginationArgSection,
      /通用：[\s\S]*XHS 搜索翻页时，如果返回了 `next_page_token`/,
      "pagination guidance that spans search, comments, and creator lists should be grouped as generic guidance"
    );

    const creatorContentArgSection = extractMarkdownSection(
      readGeneratedSkill(
        tempRoot,
        "skillhub",
        "xhs-creator-content-research",
        source.hosts.hosts
      ),
      "参数说明"
    );
    assert.match(
      creatorContentArgSection,
      /创作者 ?\/ ?账号：[\s\S]*`--pages <n>`：获取并合并 N 页创作者内容或合集条目/,
      "creator content pagination guidance should stay in the creator/account group"
    );
    assert.doesNotMatch(
      creatorContentArgSection,
      /搜索：[\s\S]*`--pages <n>`：获取并合并 N 页创作者内容或合集条目/,
      "creator content pagination guidance should not be grouped as search guidance"
    );
    assert.doesNotMatch(
      creatorContentArgSection,
      /热榜：[\s\S]*`--pages <n>`：获取并合并 N 页创作者内容或合集条目/,
      "creator content pagination guidance should not be grouped as hot-list guidance"
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("chinese-market parameter guidance labels routing notes as explanation", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const listing of source.listings.listings) {
      if (!isChineseMarketHost(listing.host)) {
        continue;
      }

      const skill = readGeneratedSkill(
        tempRoot,
        listing.host,
        listing.slug,
        source.hosts.hosts
      );
      const argSection = extractMarkdownSection(skill, "参数说明");

      assert.doesNotMatch(
        argSection,
        /^- 必填：.*(?:不需要|两种方式不要混用|先用.+再)/m,
        `${listing.host}/${listing.slug} should not label routing notes as required arguments`
      );
    }

    const aggregateArgSection = extractMarkdownSection(
      readGeneratedSkill(
        tempRoot,
        "skillhub",
        "socialdatax-content-research-assistant",
        source.hosts.hosts
      ),
      "参数说明"
    );
    assert.match(
      aggregateArgSection,
      /热榜：[\s\S]*- 说明：用户要看当前小红书热榜时，使用 `xhs hot-search`，这个命令不需要 `--keyword`。/
    );
    assert.match(
      aggregateArgSection,
      /搜索：[\s\S]*- 说明：做关键词研究时，根据平台使用 `xhs search --keyword <text>`、`douyin search --keyword <text>`、`kuaishou search --keyword <text>` 或 `weibo search --keyword <text>`。/
    );
    assert.match(
      aggregateArgSection,
      /搜索：[\s\S]*- 说明：搜索翻页时，如果返回了 `next_page_token`，再使用 `--page-token <next_page_token>`；第一页不要传。继续翻页时只能原样使用同一链路返回的完整 token。/
    );
    assert.match(
      aggregateArgSection,
      /搜索：[\s\S]*关键词研究筛选：XHS 和抖音搜索使用各自文档里的 `--sort-type` 值/
    );
    assert.match(
      aggregateArgSection,
      /详情 ?\/ ?评论：[\s\S]*- 说明：做详情、评论、回复命令时，使用示例里的内容 ID 参数，或者用对应的 URL 入口，两种方式不要混用。/
    );
    assert.match(
      aggregateArgSection,
      /详情 ?\/ ?评论：[\s\S]*XHS 评论 `--sort-type <default\|time_descending\|like_count_descending>`/
    );
    assert.doesNotMatch(
      aggregateArgSection,
      /只在关键词研究场景里用于筛选|apply only to .*keyword research/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("skillhub generated quick-start guidance matches declared command families", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const searchSkill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "xhs-topic-analysis",
      source.hosts.hosts
    );
    assert.match(
      extractMarkdownSection(searchSkill, "快速开始"),
      /关键词或选题方向/
    );
    assert.match(
      extractMarkdownSection(searchSkill, "快速开始"),
      /先取 1 页/
    );

    const commentSkill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "xhs-comment-insights",
      source.hosts.hosts
    );
    const commentQuickStart = extractMarkdownSection(commentSkill, "快速开始");
    assert.match(commentQuickStart, /内容链接、内容 ID 或一级评论 ID/);
    assert.doesNotMatch(commentQuickStart, /关键词|选题方向|先取 1 页/);
    assert.doesNotMatch(
      extractMarkdownSection(commentSkill, "示例结果"),
      /内容样本=标题/
    );

    const creatorProfileSkill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "xhs-creator-profile-insights",
      source.hosts.hosts
    );
    const creatorProfileQuickStart = extractMarkdownSection(
      creatorProfileSkill,
      "快速开始"
    );
    assert.match(creatorProfileQuickStart, /账号主页、账号分享文本或平台账号 ID/);
    assert.doesNotMatch(creatorProfileQuickStart, /关键词|选题方向|内容链接|先取 1 页/);
    assert.doesNotMatch(
      extractMarkdownSection(creatorProfileSkill, "常见问题"),
      /结果太多/
    );
    assert.doesNotMatch(
      extractMarkdownSection(creatorProfileSkill, "异常处理"),
      /分页中断/
    );

    const aggregateSkill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "socialdatax-content-research-assistant",
      source.hosts.hosts
    );
    const aggregateQuickStart = extractMarkdownSection(aggregateSkill, "快速开始");
    assert.match(aggregateQuickStart, /关键词或选题方向/);
    assert.match(aggregateQuickStart, /内容链接或内容 ID/);
    assert.match(aggregateQuickStart, /账号主页、账号分享文本或平台账号 ID/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("xhs comment insights is positioned for demand mining without expanding commands", async () => {
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
      "xhs-comment-insights",
      source.hosts.hosts
    );

    assert.match(skill, /^# 小红书评论分析与需求挖掘$/m);
    assert.match(skill, /小红书评论分析/);
    assert.match(skill, /小红书评论洞察/);
    assert.match(skill, /小红书用户反馈/);
    assert.match(skill, /小红书需求挖掘/);
    assert.match(skill, /购买顾虑/);
    assert.doesNotMatch(skill, /可继续追问/);
    assert.doesNotMatch(skill, /想继续分析/);

    for (const command of [
      "xhs comments --note-id",
      "xhs comments --url",
      "xhs sub-comments --note-id",
    ]) {
      assertDirectCliExample(
        skill,
        command,
        `xhs-comment-insights should document ${command}`
      );
    }

    assert.match(
      skill,
      /npx -y socialdatax-skills@latest xhs comments \\\n  --note-id "<note_id>" --pretty --source-client socialdatax-skills \\\n  --source-platform skillhub --source-skill xhs-comment-insights/,
      "xhs-comment-insights should wrap long direct CLI examples for SkillHub readability"
    );
    assert.match(skill, /--source-platform skillhub/);
    assert.match(skill, /--source-skill xhs-comment-insights/);
    assertNoDirectCliExample(skill, "xhs search");
    assertNoDirectCliExample(skill, "xhs detail");
    assertNoDirectCliExample(skill, "douyin comments");
    assertNoDirectCliExample(skill, "kuaishou comments");
    assertNoDirectCliExample(skill, "weibo comments");

    const args = extractMarkdownSection(skill, "参数说明");
    assert.match(
      args,
      /XHS 评论 `--sort-type <default\|time_descending\|like_count_descending>`/
    );

    const mcpTools = extractMarkdownSection(skill, "MCP 工具");
    assert.match(
      mcpTools,
      /`xhs_get_note_comments_by_note_id`：[\s\S]*可选 `sort_type` 支持 `default`、`time_descending` 或 `like_count_descending`/
    );
    assert.match(
      mcpTools,
      /`xhs_get_note_comments_by_note_url`：[\s\S]*可选 `sort_type` 支持 `default`、`time_descending` 或 `like_count_descending`/
    );

    const output = extractMarkdownSection(skill, "输出建议");
    assert.match(output, /评论主题、用户痛点、购买顾虑、未满足需求、FAQ、高频原话、可行动建议/);
    assert.match(output, /基于用户提供的小红书笔记链接或完整 `note_id` 下已返回的评论和回复/);
    assert.match(output, /不代表全平台完整覆盖/);
    assert.match(output, /不编造不存在的反馈/);
    assert.match(output, /产品改进线索/);
    assert.match(output, /客服 FAQ/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("xhs comment demand-mining copy does not leak into other comment skills", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const slug of [
      "weibo-comment-insights",
      "kuaishou-comment-insights",
      "socialdatax-comment-insights",
    ]) {
      const skill = readGeneratedSkill(
        tempRoot,
        "skillhub",
        slug,
        source.hosts.hosts
      );
      assert.match(skill, /评论主题和反馈线索，并标出下一步可继续追问的问题/);
      assert.match(skill, /判断=相关原因和下一步/);
      assert.match(skill, /想继续分析/);
      assert.doesNotMatch(skill, /评论主题、用户反馈、痛点、需求和可行动建议/);
      assert.doesNotMatch(skill, /想继续做需求挖掘/);
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("skillhub quick-start platform hints use resolved capability commands", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const sourceRoot = mkdtempSync(join(tmpdir(), "socialdatax-source-"));

  try {
    const sourceDir = copySkillSourceTo(sourceRoot);
    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));

    listings.listings.push({
      host: "skillhub",
      slug: "test-weibo-hub-resolved-platforms",
      title: "微博内容研究助手",
      description:
        "用于微博内容研究、评论洞察、转赞互动和创作者资料整理。来自 SocialDataX 社媒数据助手。",
      useWhen:
        "Use this skill when the user wants Weibo post research, comment insight, liker or repost review, creator profile review, or creator post lists.",
      capability: "weibo-hub",
    });
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    const source = await loadSkillSource({ repoRoot: sourceRoot });
    await generateSkills({
      repoRoot: sourceRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const skill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "test-weibo-hub-resolved-platforms",
      source.hosts.hosts
    );
    const quickStart = extractMarkdownSection(skill, "快速开始");
    assert.match(quickStart, /微博帖子 ID/);
    assert.doesNotMatch(quickStart, /互动内容 ID/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(sourceRoot, { recursive: true, force: true });
  }
});

test("generator rejects narratives that cross capability boundaries", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-narrative-"));

  try {
    copySkillSourceTo(badRoot);
    const listingsPath = join(
      badRoot,
      "public-listings",
      "socialdatax-skill-source",
      "listings.json"
    );
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));

    const profileListing = listings.listings.find(
      (listing) =>
        listing.host === "skillhub" &&
        listing.slug === "xhs-creator-profile-insights"
    );
    assert.ok(profileListing, "should find profile skill listing");
    profileListing.description = `${profileListing.description} 也支持关键词搜索。`;

    const topicListing = listings.listings.find(
      (listing) => listing.host === "skillhub" && listing.slug === "xhs-topic-analysis"
    );
    assert.ok(topicListing, "should find topic skill listing");
    topicListing.useWhen = `${topicListing.useWhen} 也适合评论洞察。`;

    const searchListing = listings.listings.find(
      (listing) =>
        listing.host === "skillhub" &&
        listing.slug === "socialdatax-xhs-search"
    );
    assert.ok(searchListing, "should find search skill listing");
    searchListing.description = `${searchListing.description} This entry also supports comment insight.`;

    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /narrative.*search|narrative.*评论|narrative.*comments/i
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
  }
});

test("generator rejects modelscope narratives that cross capability boundaries", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
  const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-modelscope-narrative-"));

  try {
    copySkillSourceTo(badRoot);
    const listingsPath = join(
      badRoot,
      "public-listings",
      "socialdatax-skill-source",
      "listings.json"
    );
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));

    const modelscopeListing = listings.listings.find(
      (listing) =>
        listing.host === "modelscope" &&
        listing.slug === "xhs-content-research"
    );
    assert.ok(modelscopeListing, "should find modelscope content skill listing");
    modelscopeListing.description = `${modelscopeListing.description} 也适合评论洞察。`;

    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /modelscope:xhs-content-research narrative.*评论/i
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(badRoot, { recursive: true, force: true });
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
      ["modelscope", "xhs-trend-insights-v2"],
      ["modelscope", "xhs-content-research-assistant"],
    ]) {
      const skill = readGeneratedSkill(tempRoot, host, slug, source.hosts.hosts);
      const prettyLines = skill
        .split("\n")
        .filter((line) =>
          isChineseMarketHost(host)
            ? line.includes("`--pretty`：只影响输出格式")
            : line.includes("`--pretty`: output formatting only")
        );

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

test("ordered output guidance is spaced for markdown rendering", async () => {
  const sourceRoot = mkdtempSync(join(tmpdir(), "socialdatax-source-"));
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const sourceDir = copySkillSourceTo(sourceRoot);
    const listingsPath = join(sourceDir, "listings.json");
    const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
    const listing = listings.listings.find(
      (candidate) =>
        candidate.host === "skillhub" &&
        candidate.slug === "xhs-viral-copy-breakdown"
    );
    assert.ok(listing, "source should include xhs-viral-copy-breakdown");
    listing.outputIntro = "测试输出说明。";
    listing.output = ["1. 第一项", "2. 第二项", "后续说明。"];
    writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

    const source = await loadSkillSource({ repoRoot: sourceRoot });
    await generateSkills({
      repoRoot: sourceRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const skill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "xhs-viral-copy-breakdown",
      source.hosts.hosts
    );
    const output = extractMarkdownSection(skill, "输出建议");
    assert.match(output, /测试输出说明。\n\n1\. 第一项\n2\. 第二项\n\n后续说明。/);
    assert.doesNotMatch(output, /测试输出说明。\n\n\n1\. 第一项/);
  } finally {
    rmSync(sourceRoot, { recursive: true, force: true });
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated skills use token pagination for XHS and other search platforms", async () => {
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
      /For search pagination, omit `page_token` on the first request and pass only the complete returned `next_page_token` when continuing the same chain/
    );
    assert.match(
      mediaSearch,
      /For XHS, call `xhs_search_notes` with:\n- `keyword`: required search phrase or topic; use the user's actual intent and trim whitespace\.\n- `page_token`: optional opaque pagination token/
    );
    assert.doesNotMatch(mediaSearch, /XHS `--page <number>`|Legacy `next_page`|optional 1-based page number/);
    assert.doesNotMatch(aggregateResearch, /XHS also keeps numeric `page`|legacy `next_page`/i);
    assert.doesNotMatch(aggregateResearch, /`--page` and `--page-token`/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generated media skills document weibo and wechat channel support", async () => {
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
    const mediaDetail = readGeneratedSkill(
      tempRoot,
      "npm",
      "media-detail",
      source.hosts.hosts
    );
    const mediaTranscript = readGeneratedSkill(
      tempRoot,
      "npm",
      "media-transcript",
      source.hosts.hosts
    );

    for (const skill of [mediaSearch, mediaDetail, mediaTranscript]) {
      assert.match(skill, /Weibo \/ 微博/);
      assert.match(skill, /WeChat Channels \/ 视频号/);
    }
    assert.match(mediaSearch, /weibo_search_posts/);
    assert.match(mediaSearch, /wechat_search_videos/);
    assert.match(mediaDetail, /weibo_get_post_detail_by_post_id/);
    assert.match(mediaDetail, /wechat_get_video_detail_by_encrypted_object_id/);
    assert.match(mediaDetail, /wechat_get_mp_article_detail_by_url/);
    assertDirectCliExample(
      mediaDetail,
      'wechat article --url "<mp_article_url_or_share_text>"'
    );
    assert.match(mediaTranscript, /weibo_submit_video_speech_text_by_post_url/);
    assert.match(
      mediaTranscript,
      /wechat_submit_video_speech_text_by_encrypted_object_id/
    );

    for (const skillName of [
      "socialdatax-content-research-assistant",
      "media-search",
      "media-detail",
      "media-comments",
      "media-transcript",
      "media-user-info",
      "media-user-posts",
    ]) {
      const agent = readGeneratedAgent(tempRoot, "npm", skillName, source.hosts.hosts);
      assert.match(agent, /Weibo/);
      assert.match(agent, /WeChat Channels/);
    }
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
      "kuaishou.search",
      "kuaishou.hotSearch",
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
    const npmAggregate = readGeneratedSkill(
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

    for (const skill of [npmAggregate, mediaSearch, kuaishouHub]) {
      assert.match(skill, /Kuaishou|快手/);
      assert.ok(
        extractDirectCliExamples(skill).some((example) =>
          example.includes("npx -y socialdatax-skills@latest kuaishou")
        )
      );
      assert.match(skill, /`kuaishou_/);
    }
    assertDirectCliExample(kuaishouHub, "kuaishou hot-search --pretty");
    assert.match(kuaishouHub, /kuaishou_get_hot_search_list/);
    assertDirectCliExample(kuaishouHub, "kuaishou replies --photo-id");
    assert.match(kuaishouHub, /kuaishou_get_video_comment_replies_by_comment_id/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("active SkillHub public skills do not include WeChat Channels guidance", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    for (const listing of source.listings.listings) {
      if (
        listing.host !== "skillhub" ||
        listing.slug === "socialdatax-content-research-assistant" ||
        listing.publishStatus === "retained"
      ) {
        continue;
      }
      const skill = readGeneratedSkill(
        tempRoot,
        listing.host,
        listing.slug,
        source.hosts.hosts
      );
      assert.doesNotMatch(
        skill,
        /WeChat Channels|视频号|wechat_/,
        `${listing.slug} should not include WeChat Channels guidance in SkillHub public content`
      );
    }

    const aggregate = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "socialdatax-content-research-assistant",
      source.hosts.hosts
    );
    assert.doesNotMatch(aggregate, /WeChat Channels|视频号|wechat_/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("weibo platform is present in source and generated public skills", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    assert.ok(source.catalog.platforms.weibo, "catalog should include weibo");
    for (const commandRef of [
      "weibo.hotSearch",
      "weibo.search",
      "weibo.detailId",
      "weibo.detailUrl",
      "weibo.commentsId",
      "weibo.commentsUrl",
      "weibo.replies",
      "weibo.likers",
      "weibo.reposts",
      "weibo.userInfoId",
      "weibo.userInfoUrl",
      "weibo.userPostsId",
      "weibo.userPostsUrl",
    ]) {
      resolveCommandInfo(source.catalog, commandRef);
    }

    const expectedClawhubSlugs = [
      "socialdatax-weibo",
      "socialdatax-weibo-search",
      "socialdatax-weibo-detail",
      "socialdatax-weibo-comments",
      "socialdatax-weibo-creator-profile",
      "socialdatax-weibo-creator-posts",
    ];
    const expectedSkillhubSlugs = [
      "weibo-content-research",
      "weibo-topic-analysis",
      "weibo-trend-insights",
      "weibo-competitor-research",
      "weibo-comment-insights",
    ];

    for (const slug of expectedClawhubSlugs) {
      const listing = source.listings.listings.find(
        (candidate) => candidate.host === "clawhub" && candidate.slug === slug
      );
      assert.ok(listing, `source should include clawhub/${slug}`);
      const skill = readGeneratedSkill(tempRoot, "clawhub", slug, source.hosts.hosts);
      assert.match(skill, /Weibo|微博/);
      assert.match(skill, /npx -y socialdatax-skills@latest weibo/);
    }

    for (const slug of expectedSkillhubSlugs) {
      const listing = source.listings.listings.find(
        (candidate) => candidate.host === "skillhub" && candidate.slug === slug
      );
      assert.ok(listing, `source should include skillhub/${slug}`);
      const skill = readGeneratedSkill(tempRoot, "skillhub", slug, source.hosts.hosts);
      assert.match(skill, /Weibo|微博/);
      assert.match(skill, /npx -y socialdatax-skills@latest weibo/);
    }

    const skillhubAggregate = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "socialdatax-content-research-assistant",
      source.hosts.hosts
    );
    assert.match(
      skillhubAggregate,
      /微博帖子 ID/,
      "skillhub aggregate should describe Weibo engagement input as post ID"
    );
    assert.doesNotMatch(
      skillhubAggregate,
      /微博内容 ID/,
      "skillhub aggregate should not use the less precise Weibo content ID label"
    );
    assert.match(
      skillhubAggregate,
      /微博内容列表证据|Weibo post-list evidence/,
      "skillhub/socialdatax-content-research-assistant should mention Weibo creator content-list evidence when Weibo creator commands are present"
    );
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

test("xhs viral note research is a search-only SkillHub sample research entry", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const listing = source.listings.listings.find(
      (candidate) =>
        candidate.host === "skillhub" &&
        candidate.slug === "xhs-viral-note-research"
    );
    assert.ok(listing, "source should include skillhub/xhs-viral-note-research");
    assert.equal(listing.packageSpec, XHS_VIRAL_NOTE_RESEARCH_PACKAGE_SPEC);
    assert.deepEqual(commandRefsForListing(source.catalog, listing), ["xhs.search"]);

    const skill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "xhs-viral-note-research",
      source.hosts.hosts
    );

    assert.match(skill, /^# 小红书爆款笔记研究$/m);
    assertDirectCliExample(skill, "xhs search --keyword");
    assertNoDirectCliExample(skill, "xhs detail");
    assertNoDirectCliExample(skill, "xhs comments");
    assertNoDirectCliExample(skill, "xhs user-info");
    assertNoDirectCliExample(skill, "xhs user-posts");

    const quickStart = extractMarkdownSection(skill, "快速开始");
    assert.match(quickStart, /默认取 2 页、最多 20 条样本/);
    assert.doesNotMatch(quickStart, /先取 1 页/);

    const directCliExamples = extractDirectCliExamples(skill);
    assert.equal(directCliExamples.length, 1);
    assert.match(
      directCliExamples[0],
      new RegExp(`^npx -y ${escapeRegExp(XHS_VIRAL_NOTE_RESEARCH_PACKAGE_SPEC)} `)
    );
    assert.doesNotMatch(directCliExamples[0], /socialdatax-skills@latest/);
    assert.match(directCliExamples[0], /--sort-type like_count_descending/);
    assert.match(directCliExamples[0], /--pages 2/);
    assert.match(directCliExamples[0], /--max-items 20/);
    assert.match(directCliExamples[0], /--source-platform skillhub/);
    assert.match(directCliExamples[0], /--source-skill xhs-viral-note-research/);

    const mcpTools = extractMarkdownSection(skill, "MCP 工具");
    assert.match(mcpTools, /`xhs_search_notes`/);
    assert.doesNotMatch(mcpTools, /xhs_get_note_detail|xhs_get_note_comments/);

    const output = extractMarkdownSection(skill, "输出建议");
    assert.match(output, /样本表/);
    assert.match(output, /标题钩子/);
    assert.match(output, /内容角度/);
    assert.match(output, /互动信号/);
    assert.match(output, /可复用选题/);
    assert.match(output, /完整 `note_id`/);
    assert.match(output, /完整原始 URL/);
    assert.match(output, /当前返回页范围/);
    assert.match(output, /不承诺全平台完整覆盖/);
    assert.doesNotMatch(
      output,
      /自动生成可发布笔记|封面制作|账号诊断|发布操作|保证爆款/
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("xhs hot topic selection is a SkillHub hot-list plus search topic entry", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const listing = source.listings.listings.find(
      (candidate) =>
        candidate.host === "skillhub" &&
        candidate.slug === "xhs-hot-topic-selection"
    );
    assert.ok(
      listing,
      "source should include skillhub/xhs-hot-topic-selection"
    );
    assert.deepEqual(commandRefsForListing(source.catalog, listing), [
      "xhs.hotSearch",
      "xhs.search",
    ]);

    const skill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "xhs-hot-topic-selection",
      source.hosts.hosts
    );

    assert.match(skill, /^# 小红书热榜选题分析$/m);
    assertDirectCliExample(skill, "xhs hot-search --pretty");
    assertDirectCliExample(skill, "xhs search --keyword");
    assertNoDirectCliExample(skill, "xhs detail");
    assertNoDirectCliExample(skill, "xhs comments");
    assertNoDirectCliExample(skill, "xhs user-info");
    assertNoDirectCliExample(skill, "xhs user-posts");

    const args = extractMarkdownSection(skill, "参数说明");
    assert.match(args, /^热榜：$/m);
    assert.match(args, /这个命令不需要 `--keyword`/);
    assert.match(args, /^搜索：$/m);
    assert.match(args, /搜索：[\s\S]*- 必填：`--keyword <text>`/);

    const quickStart = extractMarkdownSection(skill, "快速开始");
    assert.match(quickStart, /先看当前热榜，再选 1-3 个热点词做关键词搜索/);
    assert.match(quickStart, /热榜信号、相关热门笔记样本、选题候选/);

    const directCliExamples = extractDirectCliExamples(skill);
    assert.equal(directCliExamples.length, 2);
    assert.match(directCliExamples[0], /xhs hot-search --pretty/);
    assert.match(directCliExamples[1], /xhs search --keyword/);
    assert.match(directCliExamples[1], /--sort-type like_count_descending/);
    assert.match(directCliExamples[1], /--pages 2/);
    assert.match(directCliExamples[1], /--max-items 20/);
    for (const example of directCliExamples) {
      assert.match(example, /--source-platform skillhub/);
      assert.match(example, /--source-skill xhs-hot-topic-selection/);
    }

    const mcpTools = extractMarkdownSection(skill, "MCP 工具");
    assert.match(mcpTools, /`xhs_get_search_hot_list`/);
    assert.match(mcpTools, /`xhs_search_notes`/);
    assert.doesNotMatch(
      mcpTools,
      /xhs_get_note_detail|xhs_get_note_comments|xhs_get_user/
    );

    const output = extractMarkdownSection(skill, "输出建议");
    assert.match(output, /热榜选题分析/);
    assert.match(output, /固定结构/);
    assert.match(output, /热榜信号/);
    assert.match(output, /选题候选池/);
    assert.match(output, /热门笔记样本/);
    assert.match(output, /标题钩子/);
    assert.match(output, /内容角度/);
    assert.match(output, /不建议追的热点/);
    assert.match(output, /完整原始 URL/);
    assert.match(output, /完整 `note_id`/);
    assert.match(output, /当前返回页范围/);
    assert.match(output, /不承诺全平台完整覆盖/);
    assert.match(
      output,
      /不承诺自动生成完整发布稿、设计封面、账号诊断、执行发布或确定性流量结果/
    );
    assert.doesNotMatch(output, /保证爆款|评论洞察/);

    const exampleResult = extractMarkdownSection(skill, "示例结果");
    assert.match(exampleResult, /热榜=排名\/话题\/热度信号/);
    assert.match(exampleResult, /选题=候选方向\/适合人群\/内容角度\/标题钩子/);
    assert.match(exampleResult, /字段缺失时明确标注，不补造/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("xhs viral copy breakdown is a SkillHub search plus detail copy review entry", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const listing = source.listings.listings.find(
      (candidate) =>
        candidate.host === "skillhub" &&
        candidate.slug === "xhs-viral-copy-breakdown"
    );
    assert.ok(
      listing,
      "source should include skillhub/xhs-viral-copy-breakdown"
    );
    assert.deepEqual(commandRefsForListing(source.catalog, listing), [
      "xhs.search",
      "xhs.detailId",
      "xhs.detailUrl",
    ]);

    const skill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "xhs-viral-copy-breakdown",
      source.hosts.hosts
    );

    assert.match(skill, /^# 小红书爆款文案拆解$/m);
    assertDirectCliExample(skill, "xhs search --keyword");
    assertDirectCliExample(skill, "xhs detail --note-id");
    assertDirectCliExample(skill, "xhs detail --url");
    assertNoDirectCliExample(skill, "xhs comments");
    assertNoDirectCliExample(skill, "xhs user-info");
    assertNoDirectCliExample(skill, "xhs user-posts");

    const quickStart = extractMarkdownSection(skill, "快速开始");
    assert.match(quickStart, /关键词、赛道、产品方向、笔记链接或完整 `note_id`/);
    assert.match(quickStart, /文案拆解报告/);

    const args = extractMarkdownSection(skill, "参数说明");
    assert.match(args, /^搜索：$/m);
    assert.match(args, /`--keyword <text>`/);
    assert.doesNotMatch(args, /`search --keyword <text>`/);
    assert.match(args, /^详情：$/m);
    assert.doesNotMatch(args, /^详情 \/ 评论：$/m);
    assert.doesNotMatch(args, /^评论 \/ 回复：$/m);
    assert.doesNotMatch(args, /评论或创作者笔记列表返回/);

    const directCliExamples = extractDirectCliExamples(skill);
    assert.equal(directCliExamples.length, 3);
    assert.match(directCliExamples[0], /xhs search --keyword/);
    assert.match(directCliExamples[0], /--sort-type like_count_descending/);
    assert.match(directCliExamples[0], /--pages 2/);
    assert.match(directCliExamples[0], /--max-items 20/);
    for (const example of directCliExamples) {
      assert.match(example, /--source-platform skillhub/);
      assert.match(example, /--source-skill xhs-viral-copy-breakdown/);
    }

    const mcpTools = extractMarkdownSection(skill, "MCP 工具");
    assert.match(mcpTools, /`xhs_search_notes`/);
    assert.match(mcpTools, /`xhs_get_note_detail_by_note_id`/);
    assert.match(mcpTools, /`xhs_get_note_detail_by_note_url`/);
    assert.doesNotMatch(mcpTools, /xhs_get_note_comments|xhs_get_user/);

    const output = extractMarkdownSection(skill, "输出建议");
    assert.match(output, /文案拆解报告/);
    assert.match(output, /固定输出结构/);
    assert.match(output, /按以下顺序组织/);
    assert.match(output, /不补造。\n\n1\. 样本表/);
    assert.match(output, /样本表/);
    assert.match(output, /标题钩子/);
    assert.match(output, /开头方式/);
    assert.match(output, /卖点/);
    assert.match(output, /情绪词/);
    assert.match(output, /场景词/);
    assert.match(output, /内容结构/);
    assert.match(output, /互动引导/);
    assert.match(output, /引导评论、收藏、关注/);
    assert.match(output, /不读取评论数据/);
    assert.doesNotMatch(output, /总结评论、收藏、关注/);
    assert.match(output, /可复用文案框架/);
    assert.match(output, /下一步建议/);
    assert.match(output, /下一步建议[^\n]*\n\n如果用户给出笔记链接/);
    assert.match(output, /完整 `note_id`/);
    assert.match(output, /完整原始 URL/);
    assert.match(output, /不承诺全平台完整覆盖/);
    assert.doesNotMatch(
      output,
      /自动生成完整可发布笔记|保证爆款|封面制作|账号诊断|发布操作|评论洞察/
    );

    const exampleResult = extractMarkdownSection(skill, "示例结果");
    assert.match(exampleResult, /字段缺失时明确标注，不补造/);
    assert.doesNotMatch(exampleResult, /不代表固定字段/);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test("generator rejects unsafe or mismatched command example overrides", async () => {
  const cases = [
    {
      name: "wrong platform",
      command: 'douyin search --keyword "<keyword>" --pretty',
      error: /commandExamples\.xhs\.search must start with `xhs search`/,
    },
    {
      name: "wrong command",
      command: 'xhs detail --note-id "<note_id>" --pretty',
      error: /commandExamples\.xhs\.search must start with `xhs search`/,
    },
    {
      name: "shell control",
      command: 'xhs search --keyword "<keyword>"; echo bad --pretty',
      error: /commandExamples\.xhs\.search must not contain shell control characters/,
    },
    {
      name: "stdout redirect",
      command: 'xhs search --keyword "<keyword>" >/tmp/out --pretty',
      error: /commandExamples\.xhs\.search must not contain shell control characters/,
    },
    {
      name: "stdin redirect",
      command: 'xhs search --keyword "<keyword>" < /tmp/in --pretty',
      error: /commandExamples\.xhs\.search must not contain shell control characters/,
    },
    {
      name: "environment expansion",
      command: 'xhs search --keyword "$HOME" --pretty',
      error: /commandExamples\.xhs\.search must not contain shell control characters/,
    },
    {
      name: "subshell parentheses",
      command: 'xhs search --keyword "<keyword>" (echo bad) --pretty',
      error: /commandExamples\.xhs\.search must not contain shell control characters/,
    },
    {
      name: "unbalanced quote",
      command: 'xhs search --keyword "<keyword> --pretty',
      error: /commandExamples\.xhs\.search must contain balanced double quotes/,
    },
    {
      name: "shell escape",
      command: 'xhs search --keyword "<keyword>" \\ --pretty',
      error: /commandExamples\.xhs\.search must not contain shell control characters/,
    },
    {
      name: "single quote",
      command: "xhs search --keyword 'camp' --pretty",
      error: /commandExamples\.xhs\.search must not contain shell control characters/,
    },
  ];

  for (const testCase of cases) {
    const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
    const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

    try {
      const sourceDir = copySkillSourceTo(badRoot);
      const listingsPath = join(sourceDir, "listings.json");
      const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
      const listing = listings.listings.find(
        (candidate) =>
          candidate.host === "skillhub" &&
          candidate.slug === "xhs-viral-note-research"
      );
      assert.ok(listing, "source should include skillhub/xhs-viral-note-research");
      listing.commandExamples["xhs.search"] = testCase.command;
      writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

      await assert.rejects(
        generateSkills({
          repoRoot: badRoot,
          outRoot: tempRoot,
          quiet: true,
        }),
        testCase.error,
        testCase.name
      );
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
      rmSync(badRoot, { recursive: true, force: true });
    }
  }
});

test("short-video topic research guidance names all declared short-video platforms", async () => {
  const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));

  try {
    const source = await loadSkillSource({ repoRoot: projectRoot });
    await generateSkills({
      repoRoot: projectRoot,
      outRoot: tempRoot,
      quiet: true,
    });

    const listing = source.listings.listings.find(
      (candidate) =>
        candidate.host === "skillhub" &&
        candidate.slug === "short-video-topic-research"
    );
    assert.ok(listing, "source should include skillhub/short-video-topic-research");

    const commandRefs = commandRefsForListing(source.catalog, listing);
    assert.ok(commandRefs.some((commandRef) => commandRef.startsWith("xhs.")));
    assert.ok(commandRefs.some((commandRef) => commandRef.startsWith("douyin.")));
    assert.ok(commandRefs.some((commandRef) => commandRef.startsWith("kuaishou.")));

    const sourceOutputGuidance = (listing.output ?? []).join("\n");
    assert.match(sourceOutputGuidance, /XHS, Douyin, and Kuaishou evidence/);
    assert.doesNotMatch(sourceOutputGuidance, /Separate XHS and Douyin evidence/);

    const skill = readGeneratedSkill(
      tempRoot,
      "skillhub",
      "short-video-topic-research",
      source.hosts.hosts
    );
    assert.match(skill, /小红书、抖音和快手证据分开整理/);
    assert.doesNotMatch(skill, /XHS 和抖音证据/);
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
      const host = label.split("/", 1)[0];
      assert.match(
        skill,
        isChineseMarketHost(host)
          ? /无论是在最终回答、展示、引用、存储、输出还是转发时/
          : /in every use of a returned `note_url`, such as final answers, display, references, storage, output, or forwarding/,
        `${label} should require exact note_url preservation`
      );
      assert.match(
        skill,
        isChineseMarketHost(host)
          ? /保留完整原始 URL，包括其中的 `xsec_token` 查询参数/
          : /preserve it exactly as the full URL, including `xsec_token` query parameters/,
        `${label} should require preserving the full note_url`
      );
      assert.match(
        skill,
        isChineseMarketHost(host)
          ? /不要改写、截断、脱敏、重建，也不要只根据 `note_id` 去拼链接/
          : /Do not modify, truncate, redact, mask, normalize, rebuild, or synthesize the URL from `note_id`/,
        `${label} should forbid rebuilding note_url from note_id`
      );
      assert.match(
        skill,
        isChineseMarketHost(host)
          ? /完整复制 24 位小写十六进制 ID；不要只传或只展示前缀/
          : /complete 24-character lowercase hexadecimal ID exactly; do not pass or display only a prefix/,
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
      const host = label.split("/", 1)[0];
      if (!/page-token|page_token|next_page_token/.test(skill)) {
        continue;
      }
      assert.match(
        skill,
        isChineseMarketHost(host)
          ? /完整返回的 `next_page_token`|完整 token/
          : /complete returned `next_page_token`/,
        `${label} should require complete next_page_token reuse`
      );
      assert.match(
        skill,
        isChineseMarketHost(host)
          ? /不能截断、改写、脱敏、重建|不能截断、改写、脱敏或用省略号替换|Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses/
          : /Do not modify, truncate, redact, mask, omit, normalize, rebuild, generate, or replace the middle with ellipses/,
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
      if (supportsAgentMetadata(listing.host)) {
        assert.equal(
          readGeneratedAgent(tempRoot, listing.host, listing.slug, source.hosts.hosts),
          readRepoAgent(projectRoot, listing.host, listing.slug, source.hosts.hosts),
          `${listing.host}/${listing.slug} agent metadata should match generated output`
        );
      }
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
    const listing = source.listings.listings.find(
      (candidate) => candidate.host === "npm" && candidate.slug === skillName
    );
    assert.ok(listing, `${skillName} should have npm listing source`);
    const agentSource = readFileSync(
      join(packageDir, "skills", skillName, "agents", "openai.yaml"),
      "utf8"
    );
    const displayName = parseSimpleYamlScalar(agentSource, "display_name");
    const shortDescription = parseSimpleYamlScalar(agentSource, "short_description");
    const defaultPrompt = parseSimpleYamlScalar(agentSource, "default_prompt");

    assert.ok(displayName.trim(), `${skillName} display_name should be non-empty`);
    assert.ok(shortDescription.trim(), `${skillName} short_description should be non-empty`);
    assert.equal(
      displayName,
      listing.agentDisplayName ?? listing.title,
      `${skillName} display_name should come from source listing`
    );
    assert.equal(
      shortDescription,
      listing.agentShortDescription ?? listing.title.slice(0, 80),
      `${skillName} short_description should come from source listing`
    );
    assert.equal(
      defaultPrompt,
      listing.agentDefaultPrompt ??
        `Use $${skillName} when this skill matches the user's SocialDataX request.`,
      `${skillName} default_prompt should come from source listing`
    );
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
    /generated_socialdatax_agent_files\(project_root\)/,
    "required_public_files should include generated agent metadata discovered from listings.json"
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
      /Listing clawhub:socialdatax-xhs commands or mcpOnlyTools must resolve to a non-empty array/
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

test("generator rejects unsafe listing-level package specs", async () => {
  const cases = [
    "socialdatax-skills",
    "socialdatax-skills@0.2",
    "other-package@1.0.0",
    "socialdatax-skills@0.2.26 --ignore-scripts",
  ];

  for (const packageSpec of cases) {
    const tempRoot = mkdtempSync(join(tmpdir(), "socialdatax-skills-"));
    const badRoot = mkdtempSync(join(tmpdir(), "socialdatax-bad-source-"));

    try {
      const sourceDir = copySkillSourceTo(badRoot);
      const listingsPath = join(sourceDir, "listings.json");
      const listings = JSON.parse(readFileSync(listingsPath, "utf8"));
      const listing = listings.listings.find(
        (candidate) =>
          candidate.host === "skillhub" &&
          candidate.slug === "xhs-viral-note-research"
      );
      assert.ok(listing, "source should include skillhub/xhs-viral-note-research");
      listing.packageSpec = packageSpec;
      writeFileSync(listingsPath, `${JSON.stringify(listings, null, 2)}\n`);

      await assert.rejects(
        generateSkills({
          repoRoot: badRoot,
          outRoot: tempRoot,
          quiet: true,
        }),
        /listing skillhub:xhs-viral-note-research packageSpec must be socialdatax-skills@latest or a fixed socialdatax-skills semver package/
      );
    } finally {
      rmSync(tempRoot, { recursive: true, force: true });
      rmSync(badRoot, { recursive: true, force: true });
    }
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
    hosts.hosts.skillhub.homepage = "https://socialdatax.com/ai?from=clawhub";
    writeFileSync(hostsPath, `${JSON.stringify(hosts, null, 2)}\n`);

    await assert.rejects(
      generateSkills({
        repoRoot: badRoot,
        outRoot: tempRoot,
        quiet: true,
      }),
      /Host skillhub homepage must be https:\/\/socialdatax\.com\/ai\?from=skillhub/
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
    hosts.hosts.clawhub.homepage = ["https://socialdatax.com"];
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

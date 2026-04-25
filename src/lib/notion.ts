import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const ITEMS_DB = process.env.NOTION_ITEMS_DB!.trim();

export interface AppState {
  steps: unknown[];
  areas: unknown[];
  habits: unknown[];
  plans: unknown[];
  journal: unknown[];
  weeklyTargets: unknown[];
}

const STATE_PAGE_TITLE = "life-os-state-v1";

async function findStatePage(): Promise<string | null> {
  const res = await notion.dataSources.query({
    data_source_id: ITEMS_DB,
    filter: {
      property: "Task",
      title: { equals: STATE_PAGE_TITLE },
    },
  });
  return res.results.length > 0 ? res.results[0].id : null;
}

function extractRichText(prop: unknown): string {
  const p = prop as { rich_text?: { plain_text: string }[] };
  return p.rich_text?.map((t) => t.plain_text).join("") ?? "";
}

function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

export async function loadAppState(): Promise<AppState | null> {
  const pageId = await findStatePage();
  if (!pageId) return null;

  const blocks = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });

  let json = "";
  for (const block of blocks.results) {
    const b = block as { type: string; code?: { rich_text: { plain_text: string }[] } };
    if (b.type === "code" && b.code) {
      json += b.code.rich_text.map((t) => t.plain_text).join("");
    }
  }

  if (!json) {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const props = (page as { properties: Record<string, unknown> }).properties;
    const notes = extractRichText(props.Notes);
    if (notes) json = notes;
  }

  if (!json) return null;
  try {
    return JSON.parse(json) as AppState;
  } catch {
    return null;
  }
}

export async function saveAppState(state: AppState): Promise<void> {
  const json = JSON.stringify(state);
  let pageId = await findStatePage();

  if (!pageId) {
    const page = await notion.pages.create({
      parent: { data_source_id: ITEMS_DB },
      properties: {
        Task: { title: [{ text: { content: STATE_PAGE_TITLE } }] },
        Section: { select: { name: "Library" } },
        Notes: { rich_text: [{ text: { content: "Life OS state store" } }] },
      },
    });
    pageId = page.id;
  }

  const existing = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
  for (const block of existing.results) {
    await notion.blocks.delete({ block_id: block.id });
  }

  const chunks = chunkString(json, 1900);
  const codeBlocks = chunks.map((chunk) => ({
    object: "block" as const,
    type: "code" as const,
    code: {
      rich_text: [{ type: "text" as const, text: { content: chunk } }],
      language: "json" as const,
    },
  }));

  for (let i = 0; i < codeBlocks.length; i += 100) {
    await notion.blocks.children.append({
      block_id: pageId,
      children: codeBlocks.slice(i, i + 100),
    });
  }
}

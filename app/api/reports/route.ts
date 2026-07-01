import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { Readable } from "stream";
import { anthropic, CLAUDE_MODEL, DOTSURE_GUARDRAILS } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase-server";

const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true";
const MAX_ROWS = 500;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function rowsToText(worksheet: ExcelJS.Worksheet) {
  const lines: string[] = [];
  let truncated = false;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > MAX_ROWS) {
      truncated = true;
      return;
    }
    const values = (row.values as ExcelJS.CellValue[]).slice(1);
    lines.push(values.map((v) => (v == null ? "" : String(v))).join(","));
  });
  return { text: lines.join("\n"), truncated };
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return new Response("No file provided", { status: 400 });
  }

  if (file.size > MAX_FILE_BYTES) {
    return new Response("File too large - 5MB limit", { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !SKIP_AUTH) {
    return new Response("Unauthorized", { status: 401 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isCsv = file.name.toLowerCase().endsWith(".csv");
  const workbook = new ExcelJS.Workbook();

  try {
    if (isCsv) {
      await workbook.csv.read(Readable.from(buffer));
    } else {
      // exceljs's bundled Buffer type conflicts with this project's @types/node version;
      // the runtime type is correct.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await workbook.xlsx.load(buffer as any);
    }
  } catch {
    return new Response(
      "Could not read file - is it a valid Excel or CSV file?",
      { status: 400 }
    );
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return new Response("File has no data", { status: 400 });
  }

  const { text: dataText, truncated } = rowsToText(worksheet);

  const [{ data: profile }, { data: systemContext }] = await Promise.all([
    user
      ? supabase.from("UserProfile").select("*").eq("id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("SystemContext")
      .select("content")
      .order("updatedAt", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const systemPrompt = `You are the Dotsure Leader OS Reports analyst.

You are preparing an analysis for ${profile?.full_name || "a Dotsure leader"}, ${
    profile?.role || "Manager"
  } in the ${profile?.department || "unspecified"} department.

${systemContext?.content || ""}

${DOTSURE_GUARDRAILS}

You have been given tabular data extracted from a file named "${file.name}"${
    truncated ? ` (truncated to the first ${MAX_ROWS} rows)` : ""
  }. The first row is likely the header row.

Analyse this data and respond using exactly these section headings, in this order:

## Summary
## Insights
## Action Steps
## Risks

Be direct and commercially minded. No filler. British English throughout.`;

  const claudeStream = anthropic.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: `Here is the data:\n\n${dataText}` }],
  });

  let fullText = "";
  const encoder = new TextEncoder();

  const body = new ReadableStream({
    start(controller) {
      claudeStream.on("text", (delta: string) => {
        fullText += delta;
        controller.enqueue(encoder.encode(delta));
      });

      claudeStream.on("end", async () => {
        if (user) {
          await supabase.from("ReportAnalysis").insert({
            user_id: user.id,
            filename: file.name,
            analysis: fullText,
            data_type: isCsv ? "csv" : "xlsx",
          });
        }
        controller.close();
      });

      claudeStream.on("error", (err: Error) => {
        controller.error(err);
      });
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

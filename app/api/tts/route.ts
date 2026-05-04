import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { readFile, unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomBytes } from "crypto";

const VOICE_MAP: Record<string, string> = {
  "vi": "vi",
  "vi-central": "vi-vn-x-central",
  "vi-south": "vi-vn-x-south",
  "vi+m1": "vi+m1",
  "vi+m2": "vi+m2",
  "vi+f1": "vi+f1",
  "vi+f2": "vi+f2",
  "en": "en",
  "zh": "cmn",
  "ja": "ja",
  "ko": "ko",
  "fr": "fr",
  "de": "de",
  "es": "es",
};

function runProcess(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: "pipe" });
    let stderr = "";
    proc.stderr?.on("data", (d) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} failed (${code}): ${stderr}`));
    });
    proc.on("error", reject);
  });
}

export async function POST(request: NextRequest) {
  let wavFile = "";
  let mp3File = "";
  try {
    const body = await request.json();
    const { text, voice = "vi", speed = 1.0, pitch = 1.0 } = body as {
      text: string;
      voice?: string;
      speed?: number;
      pitch?: number;
    };

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const espeakVoice = VOICE_MAP[voice] ?? "vi";
    const speedWpm = Math.max(80, Math.min(450, Math.round(175 * speed)));
    const pitchVal = Math.max(0, Math.min(99, Math.round(pitch * 50)));

    const id = randomBytes(8).toString("hex");
    wavFile = join(tmpdir(), `vf_${id}.wav`);
    mp3File = join(tmpdir(), `vf_${id}.mp3`);

    await runProcess("espeak-ng", [
      "-v", espeakVoice,
      "-s", String(speedWpm),
      "-p", String(pitchVal),
      "-w", wavFile,
      text.trim(),
    ]);

    await runProcess("ffmpeg", [
      "-y", "-i", wavFile,
      "-codec:a", "libmp3lame",
      "-qscale:a", "4",
      mp3File,
    ]);

    const audio = await readFile(mp3File);

    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="voiceforge.mp3"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("TTS error:", err);
    return NextResponse.json(
      { error: "TTS generation failed. Make sure espeak-ng and ffmpeg are installed." },
      { status: 500 }
    );
  } finally {
    if (wavFile) unlink(wavFile).catch(() => {});
    if (mp3File) unlink(mp3File).catch(() => {});
  }
}

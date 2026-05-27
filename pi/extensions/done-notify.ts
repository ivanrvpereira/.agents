import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { execFile } from "node:child_process";

function notify(title: string, message: string): void {
	if (process.platform === "darwin") {
		execFile("osascript", [
			"-e",
			`display notification ${JSON.stringify(message)} with title ${JSON.stringify(title)}`,
		]);
		return;
	}

	process.stdout.write(`\x1b]777;notify;${title};${message}\x07`);
}

export default function doneNotify(pi: ExtensionAPI) {
	pi.on("agent_end", async () => {
		notify("Pi", "Ready for input");
	});
}
